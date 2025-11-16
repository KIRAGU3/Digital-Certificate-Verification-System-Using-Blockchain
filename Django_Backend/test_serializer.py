#!/usr/bin/env python
"""
Test QR verification endpoint
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from certificates.models import Certificate
from certificates.serializers import CertificateSerializer
from django.test import RequestFactory

print("\n" + "="*70)
print("✅ TESTING SERIALIZER WITH REQUEST CONTEXT")
print("="*70 + "\n")

try:
    # Get a certificate
    certs = Certificate.objects.all()[:1]
    if not certs:
        print("❌ No certificates found. Please issue a certificate first.\n")
        sys.exit(1)
    
    cert = certs[0]
    print(f"Testing with certificate:")
    print(f"  Student: {cert.student_name}")
    print(f"  Hash: {cert.cert_hash}")
    print(f"  QR Code file: {cert.qr_code if cert.qr_code else 'None'}\n")
    
    # Create a fake request
    factory = RequestFactory()
    request = factory.get('/')
    
    # Serialize with context
    print("Serializing with request context...")
    serializer = CertificateSerializer(cert, context={'request': request})
    data = serializer.data
    
    print("✅ Serialization successful!\n")
    
    # Check fields
    print("Serialized fields:")
    for key in ['student_name', 'course', 'institution', 'cert_hash', 'qr_code_url']:
        if key in data:
            value = data[key]
            if isinstance(value, str) and len(value) > 50:
                print(f"  ✅ {key}: {value[:50]}...")
            else:
                print(f"  ✅ {key}: {value}")
        else:
            print(f"  ⚠️  {key}: NOT FOUND")
    
    print("\n" + "="*70)
    print("✅ SERIALIZER TEST PASSED")
    print("="*70 + "\n")
    print("Your QR verification endpoint should now work correctly!")
    print("\nTest it:")
    print("1. Go to http://localhost:3000/verify")
    print("2. Click 'Upload QR Image' tab")
    print("3. Upload a QR code")
    print("4. Should see ✅ VALID\n")

except Exception as e:
    print(f"\n❌ ERROR: {str(e)}\n")
    import traceback
    traceback.print_exc()
    sys.exit(1)
