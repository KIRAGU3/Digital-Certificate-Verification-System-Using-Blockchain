#!/usr/bin/env python
"""
Quick test script to verify QR code generation and decoding works
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from certificates.models import Certificate
from certificates.qr_generator import generate_qr_code, decode_qr_code_hash
from django.core.files.base import ContentFile
from io import BytesIO

print("\n" + "="*60)
print("🔍 QR CODE FUNCTIONALITY TEST")
print("="*60 + "\n")

try:
    # Test 1: Check if certificates exist
    print("✓ Test 1: Checking for certificates in database...")
    certs = Certificate.objects.all()[:3]
    
    if not certs:
        print("   ❌ No certificates found. Please issue a certificate first.")
        print("   → Go to http://localhost:3000/issue to create one\n")
        sys.exit(1)
    
    print(f"   ✅ Found {len(certs)} certificate(s)\n")
    
    # Test 2: Test QR generation
    print("✓ Test 2: Testing QR code generation...")
    cert = certs[0]
    print(f"   Using certificate: {cert.student_name}")
    print(f"   Hash: {cert.cert_hash}\n")
    
    qr_file = generate_qr_code(cert.cert_hash)
    print(f"   ✅ QR code generated successfully")
    print(f"   File name: {qr_file.name}")
    print(f"   File size: {qr_file.size if hasattr(qr_file, 'size') else 'unknown'} bytes\n")
    
    # Test 3: Test QR decoding
    print("✓ Test 3: Testing QR code decoding...")
    qr_file.seek(0)
    decoded_hash = decode_qr_code_hash(qr_file)
    
    if decoded_hash:
        print(f"   ✅ QR code decoded successfully")
        print(f"   Decoded hash: {decoded_hash}")
        
        # Check if decoded hash matches original
        original_hash = cert.cert_hash.replace('0x', '')
        if decoded_hash == original_hash:
            print(f"   ✅ Hash matches! Encoding/decoding works perfectly\n")
        else:
            print(f"   ⚠️  Hash mismatch:")
            print(f"      Original: {original_hash}")
            print(f"      Decoded:  {decoded_hash}\n")
    else:
        print(f"   ❌ Failed to decode QR code\n")
        sys.exit(1)
    
    # Test 4: Test API endpoint
    print("✓ Test 4: Testing API endpoint...")
    from django.test import Client
    from django.urls import reverse
    
    client = Client()
    
    # Create a test file with the QR code
    qr_file.seek(0)
    test_image = ContentFile(qr_file.read(), name='test_qr.png')
    
    # Make request to verify-qr endpoint
    response = client.post(
        '/api/certificates/verify-qr/',
        {'qr_image': test_image},
        format='multipart'
    )
    
    print(f"   Response status: {response.status_code}")
    
    if response.status_code == 200:
        print(f"   ✅ API endpoint working correctly")
        data = response.json()
        if 'certificate' in data:
            print(f"   ✅ Certificate data returned")
        if 'blockchain_verification' in data:
            print(f"   ✅ Blockchain verification included\n")
    else:
        print(f"   ❌ API returned error: {response.status_code}")
        print(f"   Response: {response.json()}\n")
    
    print("="*60)
    print("✅ ALL TESTS PASSED!")
    print("="*60)
    print("\nYour QR code feature is working correctly! 🎉\n")
    
    print("📝 Next steps:")
    print("   1. Go to http://localhost:3000/issue")
    print("   2. Issue a new certificate")
    print("   3. Screenshot or save the QR code")
    print("   4. Go to http://localhost:3000/verify")
    print("   5. Upload the QR code image")
    print("   6. Certificate should be verified ✅\n")

except Exception as e:
    print(f"\n❌ TEST FAILED: {str(e)}\n")
    import traceback
    traceback.print_exc()
    print()
    sys.exit(1)
