from django.db import models
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.http import JsonResponse
from .models import Certificate
from .serializers import CertificateSerializer
from .blockchain import issue_certificate, revoke_certificate, verify_certificate_on_chain
from rest_framework.views import APIView
from rest_framework import status
from datetime import datetime
from django.utils import timezone

@api_view(['GET'])
def verify_blockchain_view(request, cert_hash):
    """
    Verify a certificate directly on the blockchain
    """
    try:
        result = verify_certificate_on_chain(cert_hash)
        is_valid, student_name, course, institution, issue_date = result
        return Response({
            'is_valid': is_valid,
            'student_name': student_name,
            'course': course,
            'institution': institution,
            'issue_date': issue_date
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def verify_certificate_view(request, cert_hash):
    """
    Verify a certificate in the database and on blockchain
    """
    try:
        # Check database
        try:
            certificate = Certificate.objects.get(cert_hash=cert_hash)
            cert_data = CertificateSerializer(certificate).data
        except Certificate.DoesNotExist:
            return Response({
                'error': 'Certificate not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verify on blockchain
        is_valid, student_name, course, institution, issue_date = verify_certificate_on_chain(cert_hash)
        
        return Response({
            'certificate': cert_data,
            'blockchain_verification': {
                'is_valid': is_valid,
                'student_name': student_name,
                'course': course,
                'institution': institution,
                'issue_date': issue_date
            }
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def revoke_certificate_view(request, cert_hash):
    """
    Revoke a certificate
    """
    try:
        try:
            certificate = Certificate.objects.get(cert_hash=cert_hash)
        except Certificate.DoesNotExist:
            return Response({
                'error': 'Certificate not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Revoke on blockchain
        tx_hash = revoke_certificate(cert_hash)
        
        # Update database
        certificate.status = 'revoked'
        certificate.revocation_date = timezone.now()
        certificate.save()
        
        return Response({
            'message': 'Certificate revoked successfully',
            'tx_hash': tx_hash
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def admin_login(request):
    """
    Authenticate admin users
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user and user.is_staff:
        return Response({
            'message': 'Login successful',
            'is_admin': True
        })
    return Response({
        'error': 'Invalid credentials'
    }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def certificate_list_view(request):
    """
    List all certificates, or filter by search criteria
    """
    try:
        search = request.GET.get('search', '')
        type = request.GET.get('type', '')
        status = request.GET.get('status', '')
        date_from = request.GET.get('date_from', '')
        date_to = request.GET.get('date_to', '')

        certificates = Certificate.objects.all()

        if search:
            certificates = certificates.filter(
                models.Q(holder_name__icontains=search) |
                models.Q(cert_hash__icontains=search)
            )
        if type:
            certificates = certificates.filter(certificate_type=type)
        if status:
            certificates = certificates.filter(status=status)
        if date_from:
            certificates = certificates.filter(issue_date__gte=date_from)
        if date_to:
            certificates = certificates.filter(issue_date__lte=date_to)

        serializer = CertificateSerializer(certificates, many=True)
        return Response({
            'results': serializer.data,
            'count': certificates.count()
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class IssueCertificateView(APIView):
    def post(self, request):
        """
        Issue a new certificate and record it on the blockchain.
        Uses the blockchain transaction hash as the cert_hash.
        """
        try:
            print("Received request data:", request.data)
            print("Received files:", request.FILES)
            print("Content-Type:", request.content_type)

            if not request.data:
                return Response({'error': 'No data received'},
                                status=status.HTTP_400_BAD_REQUEST)

            # Try both camelCase and snake_case field names
            student_name = request.data.get('studentName') or request.data.get('student_name')
            course = request.data.get('course')
            institution = request.data.get('institution')
            issue_date = request.data.get('issueDate') or request.data.get('issue_date')
            certificate_pdf = request.FILES.get('certificatePdf') or request.FILES.get('certificate_pdf')

            print("Extracted fields:", {
                'student_name': student_name,
                'course': course,
                'institution': institution,
                'issue_date': issue_date,
                'has_pdf': bool(certificate_pdf)
            })

            # Validate required fields
            missing_fields = []
            if not student_name: missing_fields.append('Student Name')
            if not course: missing_fields.append('Course')
            if not institution: missing_fields.append('Institution')
            if not issue_date: missing_fields.append('Issue Date')
            if not certificate_pdf: missing_fields.append('Certificate PDF')
            if missing_fields:
                return Response({'error': f'Missing required fields: {", ".join(missing_fields)}'},
                                status=status.HTTP_400_BAD_REQUEST)

            # Parse issue_date and convert to timezone-aware datetime
            try:
                if not isinstance(issue_date, str):
                    issue_date = issue_date.strftime('%Y-%m-%d') if hasattr(issue_date, 'strftime') else str(issue_date)
                parsed_date = datetime.strptime(issue_date, '%Y-%m-%d')
                parsed_date = parsed_date.replace(hour=12, minute=0, second=0, microsecond=0)
                aware_date = timezone.make_aware(parsed_date)
                issue_date_timestamp = int(aware_date.timestamp())
            except (ValueError, TypeError) as e:
                return Response({'error': f'Invalid date format: {str(e)}. Expected format: YYYY-MM-DD'},
                                status=status.HTTP_400_BAD_REQUEST)

            # Save datetime for DB record
            issue_date_dt = timezone.make_aware(datetime.strptime(issue_date, '%Y-%m-%d'))

            # --- Blockchain call ---
            try:
                tx_result = issue_certificate(student_name, course, institution, issue_date_timestamp)
                tx_hash = tx_result['transaction_hash']    # blockchain transaction hash
                cert_hash = tx_result['cert_hash']        # certificate hash for verification
            except Exception as blockchain_error:
                print(f"Blockchain error: {str(blockchain_error)}")
                return Response({'error': f'Blockchain transaction failed: {blockchain_error}'},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # --- Create DB record using certificate hash ---
            certificate = Certificate.objects.create(
                student_name=student_name,
                course=course,
                institution=institution,
                issue_date=issue_date_dt,
                cert_hash=cert_hash,  # Use certificate hash, not transaction hash
                certificate_pdf=certificate_pdf,
                ipfs_hash=tx_result.get('ipfs_hash', '')
            )

            return Response({
                'cert_hash': cert_hash,
                'transaction_hash': tx_hash,
                'certificate': CertificateSerializer(certificate).data,
                'message': 'Certificate issued successfully'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Error in certificate issuance: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def issue_certificate_view(request):
    """
    Legacy simple issue endpoint (kept for backward compatibility)
    """
    try:
        required_fields = ['student_name', 'course', 'institution', 'issue_date']
        for field in required_fields:
            if not request.data.get(field):
                return Response({'error': f'Missing required field: {field}'},
                                status=status.HTTP_400_BAD_REQUEST)

        timestamp = request.data.get('issue_date')
        try:
            timestamp = int(timestamp)
            issue_date = datetime.fromtimestamp(timestamp, tz=timezone.utc)
        except (ValueError, TypeError):
            return Response({'error': 'issue_date must be a valid integer timestamp'},
                            status=status.HTTP_400_BAD_REQUEST)

        result = issue_certificate(
            request.data.get('student_name'),
            request.data.get('course'),
            request.data.get('institution'),
            timestamp
        )

        if not result.get('transaction_hash'):
            return Response({'error': 'Failed to issue certificate on blockchain'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Generate a unique certificate hash that's different from the transaction hash
        cert_hash = result['cert_hash']  # This is now properly generated in the blockchain.py file
        
        certificate = Certificate.objects.create(
            student_name=request.data.get('student_name'),
            course=request.data.get('course'),
            institution=request.data.get('institution'),
            issue_date=issue_date,
            cert_hash=cert_hash,  # Use the proper certificate hash
            ipfs_hash=result.get('ipfs_hash', '')
        )

        return Response({
            'cert_hash': cert_hash,  # Use the proper certificate hash for verification
            'certificate': CertificateSerializer(certificate).data,
            'transaction_hash': result['transaction_hash']  # Keep the blockchain transaction hash separate
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def verify_certificate_view(request, cert_hash):
    """
    Verify a certificate by its hash (transaction hash).
    """
    try:
        print(f"Attempting to verify certificate: {cert_hash}")
        if not cert_hash.startswith('0x'):
            cert_hash = '0x' + cert_hash

        try:
            certificate = Certificate.objects.get(cert_hash=cert_hash)
            print(f"Certificate found in database: {certificate.student_name}")
        except Certificate.DoesNotExist:
            return Response({'error': 'Certificate not found'}, status=status.HTTP_404_NOT_FOUND)

        blockchain_valid = False
        blockchain_result = None
        blockchain_error = None

        try:
            print(f"Attempting blockchain verification for: {cert_hash}")
            blockchain_result = verify_certificate_on_chain(cert_hash)
            if blockchain_result:
                blockchain_valid = blockchain_result[0]
            else:
                blockchain_error = "Certificate does not exist on blockchain"
        except Exception as e:
            blockchain_error = str(e)
            print(f"Blockchain verification error: {blockchain_error}")

        database_valid = not certificate.is_revoked
        overall_valid = database_valid and (blockchain_valid if blockchain_result else False)

        response_data = {
            'certificate': CertificateSerializer(certificate).data,
            'is_valid': overall_valid,
            'blockchain_valid': blockchain_valid if blockchain_result else False,
            'database_valid': database_valid,
        }

        if blockchain_result:
            response_data['blockchain_details'] = {
                'student_name': blockchain_result[1],
                'course': blockchain_result[2],
                'institution': blockchain_result[3],
                'issue_date': blockchain_result[4]
            }

        if blockchain_error:
            response_data['failure_reason'] = blockchain_error
            response_data['note'] = "Certificate exists in the database but couldn't be verified on the blockchain."

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Unexpected error during verification: {str(e)}")
        return Response({'error': f'Unexpected error during verification: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        return JsonResponse({'token': 'your_jwt_token'})
    else:
        return JsonResponse({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def revoke_certificate_view(request, cert_hash):
    try:
        certificate = Certificate.objects.get(cert_hash=cert_hash)
        revoke_certificate(cert_hash)
        certificate.is_revoked = True
        certificate.save()
        return Response({
            'message': 'Certificate revoked successfully',
            'certificate': CertificateSerializer(certificate).data
        }, status=status.HTTP_200_OK)
    except Certificate.DoesNotExist:
        return Response({'error': 'Certificate not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

