#!/usr/bin/env python
"""
Diagnostic script to test the certificate verification system
Run with: python manage.py shell < diagnose_system.py
"""

import os
import sys
import django
from datetime import datetime, timezone
from django.utils import timezone as dj_timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
django.setup()

from certificates.models import Certificate
from certificates.blockchain import get_web3, get_current_contract, verify_certificate_on_chain
from certificates.qr_generator import generate_qr_code
from web3 import Web3
import time

print("=" * 80)
print("CERTIFICATE VERIFICATION SYSTEM DIAGNOSTIC")
print("=" * 80)

# Test 1: Check Blockchain Connection
print("\n1. Testing Blockchain Connection...")
print("-" * 80)
try:
    web3 = get_web3()
    if web3 and web3.is_connected():
        print("✅ Web3 connected successfully")
        print(f"   Current block: {web3.eth.block_number}")
        print(f"   Chain ID: {web3.eth.chain_id}")
        print(f"   Available accounts: {len(web3.eth.accounts)}")
    else:
        print("❌ Web3 connection failed")
except Exception as e:
    print(f"❌ Error: {str(e)}")

# Test 2: Check Smart Contract
print("\n2. Testing Smart Contract...")
print("-" * 80)
try:
    contract = get_current_contract()
    print("✅ Smart contract initialized")
    print(f"   Contract address: {contract.address}")
except Exception as e:
    print(f"❌ Error: {str(e)}")

# Test 3: List all certificates in database
print("\n3. Database Certificates...")
print("-" * 80)
certificates = Certificate.objects.all()
print(f"Total certificates in database: {certificates.count()}")
for cert in certificates:
    print(f"\n   Certificate ID: {cert.id}")
    print(f"   Student: {cert.student_name}")
    print(f"   Course: {cert.course}")
    print(f"   Hash: {cert.cert_hash}")
    print(f"   QR Code Present: {bool(cert.qr_code)}")
    print(f"   QR Code File: {cert.qr_code.name if cert.qr_code else 'None'}")
    print(f"   Issue Date: {cert.issue_date}")
    print(f"   Is Revoked: {cert.is_revoked}")
    
    # Try to verify on blockchain
    print(f"\n   Attempting blockchain verification...")
    try:
        result = verify_certificate_on_chain(cert.cert_hash)
        if result:
            is_valid, student_name, course, institution, issue_date = result
            print(f"   ✅ Found on blockchain")
            print(f"      Is Valid: {is_valid}")
            print(f"      Student: {student_name}")
            print(f"      Course: {course}")
            print(f"      Institution: {institution}")
            print(f"      Issue Date: {issue_date}")
        else:
            print(f"   ❌ Not found on blockchain")
    except Exception as e:
        print(f"   ❌ Verification failed: {str(e)}")

# Test 4: Test hash calculation
print("\n4. Testing Hash Calculation...")
print("-" * 80)
try:
    test_data = {
        'student_name': 'Test Student',
        'course': 'Test Course',
        'institution': 'Test Institution',
        'issue_date': int(datetime.now(timezone.utc).timestamp())
    }
    
    # Calculate hash the same way as blockchain
    cert_hash = '0x' + Web3.solidity_keccak(
        ['string', 'string', 'string', 'uint256'],
        [test_data['student_name'], test_data['course'], test_data['institution'], test_data['issue_date']]
    ).hex()
    
    print(f"✅ Hash calculation successful")
    print(f"   Test hash: {cert_hash}")
except Exception as e:
    print(f"❌ Error: {str(e)}")

print("\n" + "=" * 80)
print("DIAGNOSTIC COMPLETE")
print("=" * 80)
