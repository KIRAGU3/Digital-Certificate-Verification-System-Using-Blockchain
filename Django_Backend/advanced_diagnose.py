#!/usr/bin/env python
"""
Advanced Diagnostic Script - Run in Django Shell
python manage.py shell < advanced_diagnose.py
"""

import os
import sys
import django
from datetime import datetime, timezone
from django.utils import timezone as dj_timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
django.setup()

from certificates.models import Certificate
from certificates.blockchain import (
    get_web3, get_current_contract, verify_certificate_on_chain,
    issue_certificate
)
from certificates.qr_generator import generate_qr_code, decode_qr_code_hash
from web3 import Web3
import time

print("\n" + "=" * 80)
print("ADVANCED CERTIFICATE SYSTEM DIAGNOSTIC")
print("=" * 80)

# ============================================================================
# PART 1: System Status
# ============================================================================
print("\n[1/5] SYSTEM STATUS")
print("-" * 80)

try:
    web3 = get_web3()
    print(f"✅ Blockchain Connection: OK")
    print(f"   Network: {web3.net.version}")
    print(f"   Block: {web3.eth.block_number}")
    print(f"   Accounts: {len(web3.eth.accounts)}")
except Exception as e:
    print(f"❌ Blockchain Connection: FAILED")
    print(f"   Error: {str(e)}")
    web3 = None

try:
    contract = get_current_contract()
    print(f"✅ Smart Contract: OK")
    print(f"   Address: {contract.address}")
except Exception as e:
    print(f"❌ Smart Contract: FAILED")
    print(f"   Error: {str(e)}")

# ============================================================================
# PART 2: Certificate Analysis
# ============================================================================
print("\n[2/5] CERTIFICATE DATABASE ANALYSIS")
print("-" * 80)

certs = Certificate.objects.all()
print(f"Total Certificates: {certs.count()}")

if certs.count() == 0:
    print("⚠️  No certificates in database")
else:
    for cert in certs:
        print(f"\n🔹 Certificate ID #{cert.id}")
        print(f"   Student: {cert.student_name}")
        print(f"   Hash: {cert.cert_hash}")
        print(f"   Date: {cert.issue_date}")
        print(f"   Revoked: {cert.is_revoked}")
        
        # Check QR code
        if cert.qr_code:
            print(f"   ✅ QR Code: EXISTS ({cert.qr_code.size} bytes)")
            qr_path = cert.qr_code.path
            if os.path.exists(qr_path):
                print(f"      File: {qr_path}")
                print(f"      Size: {os.path.getsize(qr_path)} bytes")
            else:
                print(f"      ❌ File not found: {qr_path}")
        else:
            print(f"   ⚠️  QR Code: MISSING")

# ============================================================================
# PART 3: Hash Verification
# ============================================================================
print("\n[3/5] HASH VERIFICATION ANALYSIS")
print("-" * 80)

for cert in certs:
    print(f"\n🔹 Verifying Certificate #{cert.id} ({cert.cert_hash[:16]}...)")
    
    try:
        # Try to verify on blockchain
        result = verify_certificate_on_chain(cert.cert_hash)
        
        if result:
            is_valid, student_name, course, institution, issue_date = result
            print(f"   ✅ BLOCKCHAIN: Found")
            print(f"      Valid: {is_valid}")
            print(f"      Student: {student_name}")
            print(f"      Course: {course}")
            print(f"      Institution: {institution}")
            print(f"      Issue Date (ts): {issue_date}")
            
            # Verify data matches
            db_student = cert.student_name
            db_course = cert.course
            db_institution = cert.institution
            
            matches = {
                'student': db_student.strip() == student_name.strip(),
                'course': db_course.strip() == course.strip(),
                'institution': db_institution.strip() == institution.strip(),
            }
            
            print(f"      Data Match:")
            print(f"         Student: {matches['student']}")
            print(f"         Course: {matches['course']}")
            print(f"         Institution: {matches['institution']}")
            
            if not all(matches.values()):
                print(f"      ⚠️  WARNING: Data mismatch detected!")
        else:
            print(f"   ❌ BLOCKCHAIN: Not Found (None returned)")
            
    except Exception as e:
        print(f"   ❌ BLOCKCHAIN: Error")
        print(f"      {str(e)}")

# ============================================================================
# PART 4: Hash Calculation Test
# ============================================================================
print("\n[4/5] HASH CALCULATION TEST")
print("-" * 80)

# Get the first certificate and recalculate its hash
if certs.exists():
    cert = certs.first()
    print(f"Recalculating hash for certificate #{cert.id}")
    print(f"   Student: {cert.student_name}")
    print(f"   Course: {cert.course}")
    print(f"   Institution: {cert.institution}")
    print(f"   Issue Date: {cert.issue_date}")
    
    # Convert issue_date to timestamp
    issue_date_ts = int(cert.issue_date.timestamp())
    print(f"   Issue Date (timestamp): {issue_date_ts}")
    
    # Recalculate hash
    try:
        recalc_hash = '0x' + Web3.solidity_keccak(
            ['string', 'string', 'string', 'uint256'],
            [cert.student_name, cert.course, cert.institution, issue_date_ts]
        ).hex()
        
        print(f"\n   Original Hash:     {cert.cert_hash}")
        print(f"   Recalculated Hash: {recalc_hash}")
        print(f"   Match: {'✅ YES' if cert.cert_hash.lower() == recalc_hash.lower() else '❌ NO'}")
        
        if cert.cert_hash.lower() != recalc_hash.lower():
            print(f"   ⚠️  Hash mismatch! This could indicate:")
            print(f"       1. Data was modified after issuance")
            print(f"       2. Timezone difference in timestamp calculation")
            print(f"       3. Extra whitespace in student/course/institution")
    except Exception as e:
        print(f"   ❌ Error recalculating hash: {str(e)}")

# ============================================================================
# PART 5: Verification Flow Test
# ============================================================================
print("\n[5/5] VERIFICATION FLOW TEST")
print("-" * 80)

if certs.exists():
    cert = certs.first()
    print(f"Testing verification flow for certificate #{cert.id}")
    print(f"Hash: {cert.cert_hash}")
    
    print(f"\n   Step 1: Database lookup...")
    try:
        db_cert = Certificate.objects.get(cert_hash=cert.cert_hash)
        print(f"   ✅ Found in database")
    except:
        print(f"   ❌ Not found in database")
        db_cert = None
    
    print(f"\n   Step 2: Blockchain verification...")
    try:
        blockchain_result = verify_certificate_on_chain(cert.cert_hash)
        if blockchain_result:
            print(f"   ✅ Found on blockchain")
            is_valid = True
        else:
            print(f"   ❌ Not found on blockchain (None)")
            blockchain_result = None
            is_valid = False
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        blockchain_result = None
        is_valid = False
    
    print(f"\n   Step 3: Overall validity...")
    database_valid = db_cert and not db_cert.is_revoked
    overall_valid = database_valid and (blockchain_result is not None)
    
    print(f"   Database Valid: {database_valid}")
    print(f"   Blockchain Valid: {blockchain_result is not None}")
    print(f"   Overall Valid: {overall_valid}")
    
    if not overall_valid:
        print(f"\n   ❌ Certificate would show as INVALID")
        if not database_valid:
            print(f"      Reason: Not in database or is revoked")
        if blockchain_result is None:
            print(f"      Reason: Not found on blockchain")
    else:
        print(f"\n   ✅ Certificate would show as VALID")

print("\n" + "=" * 80)
print("DIAGNOSTIC COMPLETE")
print("=" * 80 + "\n")
