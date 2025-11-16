#!/usr/bin/env python
"""
Test QR verification endpoint
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from certificates.models import Certificate
from django.test import Client
from io import BytesIO

print("\n" + "="*70)
print("🧪 QR VERIFICATION ENDPOINT TEST")
print("="*70 + "\n")

try:
    # Get a certificate
    certs = Certificate.objects.all()
    if not certs:
        print("❌ No certificates found\n")
        sys.exit(1)
    
    cert = certs[0]
    print(f"Testing with certificate:")
    print(f"  Student: {cert.student_name}")
    print(f"  Hash: {cert.cert_hash}\n")
    
    # Get the QR code
    if not cert.qr_code:
        print("❌ Certificate has no QR code\n")
        sys.exit(1)
    
    print(f"✅ Certificate has QR code: {cert.qr_code.name}\n")
    
    # Test the endpoint
    client = Client()
    
    # Read the QR code file
    qr_file_path = cert.qr_code.path
    print(f"Reading QR from: {qr_file_path}")
    
    with open(qr_file_path, 'rb') as f:
        qr_image_data = f.read()
    
    print(f"QR file size: {len(qr_image_data)} bytes\n")
    
    # Create a file-like object
    qr_file = BytesIO(qr_image_data)
    qr_file.name = 'test_qr.png'
    
    # Make request to verify-qr endpoint
    print("Sending request to /api/certificates/verify-qr/...\n")
    
    response = client.post(
        '/api/certificates/verify-qr/',
        {'qr_image': qr_file},
        format='multipart'
    )
    
    print(f"Response status: {response.status_code}\n")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ SUCCESS!\n")
        print(f"Response keys: {list(data.keys())}\n")
        print(f"Certificate verified: {data.get('blockchain_verification', {}).get('is_valid', False)}")
    else:
        print(f"❌ ERROR: {response.status_code}\n")
        try:
            print(f"Response: {response.json()}")
        except:
            print(f"Response (text): {response.text}")

except Exception as e:
    print(f"Test failed: {str(e)}\n")
    import traceback
    traceback.print_exc()
