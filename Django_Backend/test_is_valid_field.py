#!/usr/bin/env python
"""
Quick test to check what the smart contract returns for is_valid
"""

import os
import sys
import django
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from certificates.blockchain import get_web3, get_contract, issue_certificate
from web3 import Web3
import time

print("\n" + "="*70)
print("🔍 SMART CONTRACT is_valid FIELD TEST")
print("="*70 + "\n")

try:
    # Get web3 and contract
    web3 = get_web3()
    contract = get_contract(web3)
    
    print("✅ Connected to blockchain and contract\n")
    
    # Create test data
    student_name = f"Test Student {int(time.time())}"
    course = "Test Course"
    institution = "Test Institution"
    issue_date_str = datetime.now().strftime("%Y-%m-%d")
    
    print(f"Issuing test certificate:")
    print(f"  Student: {student_name}")
    print(f"  Course: {course}")
    print(f"  Institution: {institution}")
    print(f"  Date: {issue_date_str}\n")
    
    # Issue certificate
    cert_hash = issue_certificate(student_name, course, institution, issue_date_str)
    print(f"✅ Certificate issued!")
    print(f"   Hash: {cert_hash}\n")
    
    # Wait a moment for blockchain to process
    time.sleep(2)
    
    # Now verify it
    print("Verifying certificate on blockchain...\n")
    
    hash_to_verify = cert_hash
    if hash_to_verify.startswith('0x'):
        hash_to_verify = hash_to_verify[2:]
    
    cert_hash_bytes = bytes.fromhex(hash_to_verify)
    
    result = contract.functions.verifyCertificate(cert_hash_bytes).call()
    is_valid, student_name_returned, course_returned, institution_returned, issue_date_returned = result
    
    print(f"Blockchain Verification Result:")
    print(f"  is_valid: {is_valid} {'✅' if is_valid else '❌'}")
    print(f"  Student Name: {student_name_returned}")
    print(f"  Course: {course_returned}")
    print(f"  Institution: {institution_returned}")
    print(f"  Issue Date: {issue_date_returned}")
    
    print("\n" + "="*70)
    if is_valid:
        print("✅ SUCCESS: is_valid is TRUE")
        print("   Certificates should be marked as valid")
    else:
        print("❌ ISSUE: is_valid is FALSE")
        print("   This is why certificates appear invalid!")
        print("\n   Root Cause: Smart contract not setting is_valid = true")
        print("   Check Certificate.sol issueCertificate() function")
    print("="*70 + "\n")

except Exception as e:
    print(f"Error: {str(e)}\n")
    import traceback
    traceback.print_exc()
