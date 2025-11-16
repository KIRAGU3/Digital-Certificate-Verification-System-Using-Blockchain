#!/usr/bin/env python
"""
Simple test - just check if blockchain returns is_valid correctly
"""

import os
import sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')

# Setup Django first
import django
django.setup()

from certificates.models import Certificate

# Get latest certificate
certs = Certificate.objects.all().order_by('-created_at')
if not certs:
    print("No certificates found!")
    sys.exit(1)

cert = certs[0]
print(f"\nLatest certificate:")
print(f"  Student: {cert.student_name}")
print(f"  Hash: {cert.cert_hash}")
print(f"  Is Revoked (DB): {cert.is_revoked}")
print()

# Test blockchain verification
from certificates.blockchain import verify_certificate_on_chain

try:
    print(f"Verifying on blockchain...")
    result = verify_certificate_on_chain(cert.cert_hash)
    is_valid, student_name, course, institution, issue_date = result
    
    print(f"\nBlockchain returned:")
    print(f"  is_valid: {is_valid}")
    print(f"  Student: {student_name}")
    print(f"  Course: {course}")
    print(f"  Institution: {institution}")
    print(f"  Issue Date: {issue_date}")
    
    print(f"\nResult:")
    if is_valid:
        print(f"✅ Certificate is VALID on blockchain")
    else:
        print(f"❌ Certificate is marked INVALID on blockchain")
        print(f"\n   The smart contract is returning is_valid = FALSE!")
        print(f"   This is causing certificates to appear invalid in the UI.")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
