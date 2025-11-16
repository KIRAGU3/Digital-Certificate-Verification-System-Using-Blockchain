from django.db import models
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.http import JsonResponse
from .models import Certificate
from .serializers import CertificateSerializer
from .blockchain import issue_certificate, revoke_certificate, verify_certificate_on_chain
from .qr_generator import generate_qr_code, decode_qr_code_hash
from rest_framework.views import APIView
from rest_framework import status
from datetime import datetime
from django.utils import timezone
import time

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
def verify_certificate_legacy(request, cert_hash):
    """
    Verify a certificate in the database and on blockchain
    LEGACY VERSION - Do not use
    """
    try:
        # Check database
        try:
            certificate = Certificate.objects.get(cert_hash=cert_hash)
            cert_data = CertificateSerializer(certificate, context={'request': request}).data
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

        serializer = CertificateSerializer(certificates, many=True, context={'request': request})
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
            issue_date_timestamp = request.data.get('issueDateTimestamp') or request.data.get('issue_date_timestamp')
            certificate_pdf = request.FILES.get('certificatePdf') or request.FILES.get('certificate_pdf')

            print("Extracted fields:", {
                'student_name': student_name,
                'course': course,
                'institution': institution,
                'issue_date': issue_date,
                'issue_date_timestamp': issue_date_timestamp,
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

            # Parse issue_date and convert to timestamp
            try:
                if not isinstance(issue_date, str):
                    issue_date = issue_date.strftime('%Y-%m-%d') if hasattr(issue_date, 'strftime') else str(issue_date)
                
                # Try to use the timestamp from frontend if provided, otherwise calculate it
                if issue_date_timestamp:
                    try:
                        issue_date_timestamp = int(issue_date_timestamp)
                        print(f"Using frontend-provided timestamp: {issue_date_timestamp}")
                    except (ValueError, TypeError):
                        print(f"Invalid timestamp from frontend: {issue_date_timestamp}, calculating from date")
                        issue_date_timestamp = None
                
                if not issue_date_timestamp:
                    # Calculate timestamp from date string at midnight UTC
                    # This ensures consistent hash generation across timezones
                    parsed_date = datetime.strptime(issue_date, '%Y-%m-%d')
                    parsed_date = parsed_date.replace(hour=0, minute=0, second=0, microsecond=0)
                    # Use UTC timezone explicitly
                    from django.utils.timezone import make_aware, utc
                    aware_date = timezone.make_aware(parsed_date, timezone=utc)
                    issue_date_timestamp = int(aware_date.timestamp())
                    print(f"Calculated timestamp from date: {issue_date_timestamp}")
                
                # Verify the timestamp is reasonable
                current_time = int(time.time())
                one_day_in_seconds = 24 * 60 * 60
                if issue_date_timestamp > current_time + one_day_in_seconds:
                    return Response({'error': 'Issue date cannot be in the future'},
                                    status=status.HTTP_400_BAD_REQUEST)
                if issue_date_timestamp < 946684800:  # Jan 1, 2000
                    return Response({'error': 'Issue date seems too old (before year 2000)'},
                                    status=status.HTTP_400_BAD_REQUEST)
                    
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

            # Generate QR code for the certificate
            try:
                qr_code_file = generate_qr_code(cert_hash)
                certificate.qr_code = qr_code_file
                certificate.save()
                print(f"QR code generated and saved for certificate: {cert_hash}")
            except Exception as qr_error:
                print(f"Warning: QR code generation failed: {str(qr_error)}")
                # Don't fail the entire operation if QR generation fails

            return Response({
                'cert_hash': cert_hash,
                'transaction_hash': tx_hash,
                'qr_code_url': certificate.qr_code.url if certificate.qr_code else None,
                'certificate': CertificateSerializer(certificate, context={'request': request}).data,
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
            'certificate': CertificateSerializer(certificate, context={'request': request}).data,
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
                blockchain_valid = True
                print(f"✅ Certificate found on blockchain - marked as valid")
                print(f"   Blockchain data: {blockchain_result}")
            else:
                blockchain_error = "Certificate does not exist on blockchain"
                print(f"⚠️  {blockchain_error}")
        except Exception as e:
            blockchain_error = str(e)
            blockchain_result = None
            print(f"❌ Blockchain verification error: {blockchain_error}")
            import traceback
            traceback.print_exc()

        database_valid = not certificate.is_revoked
        # Certificate is valid if:
        # 1. Not revoked in database AND
        # 2. Found on blockchain (blockchain_result is not None)
        overall_valid = database_valid and (blockchain_result is not None)
        
        print(f"✅ VERIFICATION RESULT:")
        print(f"   database_valid (not is_revoked): {database_valid}")
        print(f"   blockchain_result found: {blockchain_result is not None}")
        print(f"   overall_valid: {overall_valid}")

        response_data = {
            'certificate': CertificateSerializer(certificate, context={'request': request}).data,
            'is_valid': overall_valid,
            'blockchain_valid': blockchain_valid if blockchain_result else False,
            'database_valid': database_valid,
        }

        if blockchain_result:
            response_data['blockchain_details'] = {
                'student_name': str(blockchain_result[1]) if blockchain_result[1] else '',
                'course': str(blockchain_result[2]) if blockchain_result[2] else '',
                'institution': str(blockchain_result[3]) if blockchain_result[3] else '',
                'issue_date': int(blockchain_result[4]) if blockchain_result[4] else 0
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
            'certificate': CertificateSerializer(certificate, context={'request': request}).data
        }, status=status.HTTP_200_OK)
    except Certificate.DoesNotExist:
        return Response({'error': 'Certificate not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def verify_by_qr_code(request):
    """
    Verify certificate by decoding QR code image or data URL
    Accepts either file upload or data URL in request body
    """
    try:
        # Check for file upload
        qr_image = request.FILES.get('qr_image')
        qr_data_url = request.data.get('qr_data_url')  # Base64 data URL
        
        cert_hash = None
        
        if qr_image:
            # Decode hash from uploaded QR image
            cert_hash = decode_qr_code_hash(qr_image)
        elif qr_data_url:
            # Handle base64 data URL
            import base64
            from io import BytesIO
            from PIL import Image
            
            try:
                # Parse data URL format: data:image/png;base64,<data>
                if ',' in qr_data_url:
                    base64_data = qr_data_url.split(',')[1]
                else:
                    base64_data = qr_data_url
                
                image_data = base64.b64decode(base64_data)
                qr_image = BytesIO(image_data)
                cert_hash = decode_qr_code_hash(qr_image)
            except Exception as e:
                return Response({
                    'error': f'Failed to decode data URL: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'error': 'No QR image or data provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not cert_hash:
            return Response({
                'error': 'Could not decode certificate hash from QR code'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Now verify the certificate using the decoded hash
        try:
            certificate = Certificate.objects.get(cert_hash=f'0x{cert_hash}')
            cert_data = CertificateSerializer(certificate, context={'request': request}).data
        except Certificate.DoesNotExist:
            return Response({
                'error': 'Certificate not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verify on blockchain
        blockchain_valid = False
        blockchain_result = None
        student_name = ''
        course = ''
        institution = ''
        issue_date = 0
        
        try:
            blockchain_result = verify_certificate_on_chain(f'0x{cert_hash}')
            if blockchain_result:
                is_valid, student_name, course, institution, issue_date = blockchain_result
                # If certificate is found on blockchain, it's valid
                blockchain_valid = True
                print(f"✅ Blockchain verification successful for {cert_hash}")
        except Exception as e:
            print(f"Blockchain verification error: {str(e)}")
            import traceback
            traceback.print_exc()
            blockchain_valid = False
            blockchain_result = None
        
        # Build response with safe data types
        response_data = {
            'certificate': cert_data,
            'blockchain_verification': {
                'is_valid': bool(blockchain_valid),
                'student_name': str(student_name) if student_name else '',
                'course': str(course) if course else '',
                'institution': str(institution) if institution else '',
                'issue_date': int(issue_date) if issue_date else 0
            },
            'blockchain_found': blockchain_result is not None
        }
        
        return Response(response_data)
    except Exception as e:
        print(f"QR verification error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': f'QR verification failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


