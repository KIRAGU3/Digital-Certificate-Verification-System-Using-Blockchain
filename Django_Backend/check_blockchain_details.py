#!/usr/bin/env python
"""
Complete diagnostic - check entire verification flow
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from certificates.models import Certificate
from certificates.views import verify_certificate_view
from django.test import RequestFactory
import json

print("\n" + "="*70)
print("🔍 COMPLETE VERIFICATION FLOW DIAGNOSTIC")
print("="*70 + "\n")

try:
    # Get a certificate from database
    certs = Certificate.objects.all()
    if not certs:
        print("❌ No certificates in database\n")
        sys.exit(1)
    
    cert = certs[0]
    print(f"Testing with certificate:")
    print(f"  Student: {cert.student_name}")
    print(f"  Hash: {cert.cert_hash}")
    print(f"  Is Revoked: {cert.is_revoked}")
    print(f"  Created: {cert.created_at}\n")
    
    # Test 1: Check blockchain verification directly
    print("Step 1: Direct Blockchain Verification")
    print("-" * 70)
    from certificates.blockchain import verify_certificate_on_chain
    
    try:
        result = verify_certificate_on_chain(cert.cert_hash)
        is_valid, student_name, course, institution, issue_date = result
        
        print(f"✅ Blockchain response received:")
        print(f"   is_valid: {is_valid} (type: {type(is_valid).__name__})")
        print(f"   Student: {student_name}")
        print(f"   Course: {course}")
        print(f"   Institution: {institution}")
        print(f"   Issue Date: {issue_date}\n")
    except Exception as e:
        print(f"❌ Blockchain verification failed: {e}\n")
        is_valid = False
    
    # Test 2: Check database status
    print("Step 2: Database Status Check")
    print("-" * 70)
    database_valid = not cert.is_revoked
    print(f"Certificate is_revoked: {cert.is_revoked}")
    print(f"Database valid (not revoked): {database_valid}\n")
    
    # Test 3: Calculate overall valid
    print("Step 3: Overall Validity Calculation")
    print("-" * 70)
    blockchain_valid = is_valid if result else False
    overall_valid = database_valid and blockchain_valid
    
    print(f"database_valid: {database_valid}")
    print(f"blockchain_valid: {blockchain_valid}")
    print(f"overall_valid: {overall_valid}\n")
    
    if not overall_valid:
        print("⚠️  ISSUE DETECTED!")
        if not database_valid:
            print("   - Database marked certificate as revoked")
        if not blockchain_valid:
            print("   - Blockchain marked certificate as invalid")
    
    # Test 4: Simulate the API response
    print("Step 4: Simulated API Response")
    print("-" * 70)
    
    from certificates.serializers import CertificateSerializer
    
    response_data = {
        'certificate': CertificateSerializer(cert).data,
        'is_valid': overall_valid,
        'blockchain_valid': blockchain_valid,
        'database_valid': database_valid,
    }
    
    if result:
        response_data['blockchain_details'] = {
            'student_name': student_name,
            'course': course,
            'institution': institution,
            'issue_date': issue_date
        }
    
    print(f"API would return:")
    print(json.dumps({
        'is_valid': response_data['is_valid'],
        'blockchain_valid': response_data['blockchain_valid'],
        'database_valid': response_data['database_valid'],
        'blockchain_details': response_data.get('blockchain_details', {})
    }, indent=2))
    
    print("\n" + "="*70)
    print("DIAGNOSTIC SUMMARY")
    print("="*70 + "\n")
    
    if overall_valid:
        print("✅ Certificate should appear as VALID")
    else:
        print("❌ Certificate appears as INVALID\n")
        print("Troubleshooting:")
        if not blockchain_valid:
            print("1. Blockchain shows is_valid = FALSE")
            print("   → Try re-issuing the certificate")
            print("   → Check smart contract deployment")
        if not database_valid:
            print("2. Database shows is_revoked = TRUE")
            print("   → Certificate was revoked")
            print("   → Delete and re-issue")

except Exception as e:
    print(f"\n❌ DIAGNOSTIC FAILED: {str(e)}\n")
    import traceback
    traceback.print_exc()
