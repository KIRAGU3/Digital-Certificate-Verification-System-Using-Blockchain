#!/usr/bin/env python
"""
Check why certificate is marked as invalid
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from certificates.models import Certificate

print("\n" + "="*70)
print("🔍 CHECKING CERTIFICATE STATUS")
print("="*70 + "\n")

# Get the certificate for Esther, Nursing course
certs = Certificate.objects.filter(student_name='Esther', course='Nursing')

if not certs:
    print("❌ No certificate found for Esther/Nursing\n")
    sys.exit(1)

cert = certs[0]

print(f"Certificate: {cert.student_name}")
print(f"Course: {cert.course}")
print(f"Institution: {cert.institution}")
print(f"Hash: {cert.cert_hash}")
print(f"Is Revoked (database): {cert.is_revoked}")
print(f"QR Code: {cert.qr_code if cert.qr_code else 'None'}\n")

# Test blockchain
from certificates.blockchain import verify_certificate_on_chain

print("Testing blockchain verification...")
try:
    result = verify_certificate_on_chain(cert.cert_hash)
    if result:
        is_valid, name, course, inst, date = result
        print(f"✅ Blockchain response received")
        print(f"   is_valid: {is_valid}")
        print(f"   Name: {name}")
        print(f"   Course: {course}")
        print(f"   Date: {date}\n")
        
        # Calculate what overall_valid should be
        database_valid = not cert.is_revoked
        blockchain_result_found = result is not None
        overall_valid = database_valid and blockchain_result_found
        
        print(f"Calculation:")
        print(f"  database_valid (not is_revoked): {database_valid}")
        print(f"  blockchain_result is not None: {blockchain_result_found}")
        print(f"  overall_valid: {overall_valid}")
        
        if overall_valid:
            print(f"\n✅ Certificate SHOULD BE MARKED AS VALID")
        else:
            print(f"\n❌ Certificate marked as INVALID because:")
            if not database_valid:
                print(f"   - is_revoked = True")
            if not blockchain_result_found:
                print(f"   - blockchain_result is None")
    else:
        print(f"❌ Blockchain returned None\n")
        
except Exception as e:
    print(f"❌ Error: {e}\n")
    import traceback
    traceback.print_exc()
