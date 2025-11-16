#!/usr/bin/env python
"""
Diagnostic script to check why certificates are marked as invalid
"""

import os
import sys
import django
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from certificates.models import Certificate
from certificates.blockchain import verify_certificate_on_chain, get_web3, get_contract
from web3 import Web3

print("\n" + "="*70)
print("🔍 CERTIFICATE VERIFICATION DIAGNOSTIC")
print("="*70 + "\n")

try:
    # Step 1: Check blockchain connection
    print("Step 1: Checking Blockchain Connection...")
    try:
        web3 = get_web3()
        print("✅ Blockchain connected")
        print(f"   Block number: {web3.eth.block_number}")
        print(f"   Chain ID: {web3.eth.chain_id}\n")
    except Exception as e:
        print(f"❌ Blockchain connection failed: {e}\n")
        sys.exit(1)
    
    # Step 2: Check contract
    print("Step 2: Checking Smart Contract...")
    try:
        contract = get_contract(web3)
        print("✅ Contract loaded")
        print(f"   Contract address: {contract.address}\n")
    except Exception as e:
        print(f"❌ Contract loading failed: {e}\n")
        sys.exit(1)
    
    # Step 3: Get certificates from database
    print("Step 3: Checking Database Certificates...")
    certs = Certificate.objects.all()
    if not certs:
        print("❌ No certificates found in database\n")
        sys.exit(1)
    
    print(f"✅ Found {len(certs)} certificate(s)\n")
    
    # Step 4: Test each certificate
    print("Step 4: Testing Certificate Verification...\n")
    
    for i, cert in enumerate(certs[:3], 1):  # Test first 3
        print(f"\n--- Certificate {i} ---")
        print(f"Student: {cert.student_name}")
        print(f"Course: {cert.course}")
        print(f"Institution: {cert.institution}")
        print(f"Hash: {cert.cert_hash}")
        print(f"Issue Date: {cert.issue_date}")
        
        # Try to verify directly on blockchain
        print("\nVerifying on blockchain...")
        try:
            # Extract hash without 0x prefix
            hash_to_verify = cert.cert_hash
            if hash_to_verify.startswith('0x'):
                hash_to_verify = hash_to_verify[2:]
            
            print(f"Using hash: {hash_to_verify}")
            
            # Convert to bytes32
            cert_hash_bytes = bytes.fromhex(hash_to_verify)
            print(f"Hash bytes: {cert_hash_bytes.hex()}")
            
            # Call contract function
            print("Calling contract.verifyCertificate()...")
            result = contract.functions.verifyCertificate(cert_hash_bytes).call()
            is_valid, student_name, course, institution, issue_date = result
            
            print(f"\nBlockchain Response:")
            print(f"  Is Valid: {is_valid} {'✅' if is_valid else '❌'}")
            print(f"  Student Name: {student_name}")
            print(f"  Course: {course}")
            print(f"  Institution: {institution}")
            print(f"  Issue Date (timestamp): {issue_date}")
            
            # Compare with database
            print(f"\nDatabase Values:")
            print(f"  Student Name: {cert.student_name}")
            print(f"  Course: {cert.course}")
            print(f"  Institution: {cert.institution}")
            print(f"  Issue Date: {int(cert.issue_date.timestamp())}")
            
            # Check for mismatches
            if is_valid:
                print(f"\n✅ Certificate is VALID on blockchain")
            else:
                print(f"\n❌ Certificate is marked INVALID on blockchain")
                print("\nPossible reasons:")
                print("   1. Certificate was revoked")
                print("   2. Smart contract state issue")
                print("   3. Hash mismatch")
            
            # Verify data matches
            if (student_name == cert.student_name and 
                course == cert.course and 
                institution == cert.institution):
                print("✅ Data matches between database and blockchain")
            else:
                print("⚠️  Data mismatch!")
                print(f"   Names match: {student_name == cert.student_name}")
                print(f"   Courses match: {course == cert.course}")
                print(f"   Institutions match: {institution == cert.institution}")
        
        except Exception as verify_error:
            print(f"❌ Verification error: {str(verify_error)}")
            if "not found" in str(verify_error).lower():
                print("   → Certificate not found on blockchain!")
            elif "revert" in str(verify_error).lower():
                print("   → Smart contract revert error")
    
    print("\n" + "="*70)
    print("DIAGNOSTIC COMPLETE")
    print("="*70 + "\n")
    
    # Recommendations
    print("📋 RECOMMENDATIONS:\n")
    
    if not certs:
        print("1. Issue a new certificate first")
        print("   → Go to http://localhost:3000/issue")
    else:
        # Check if blockchain verification is working
        try:
            test_cert = certs[0]
            test_hash = test_cert.cert_hash
            if test_hash.startswith('0x'):
                test_hash = test_hash[2:]
            
            test_result = contract.functions.verifyCertificate(
                bytes.fromhex(test_hash)
            ).call()
            
            is_valid = test_result[0]
            if is_valid:
                print("✅ Your certificates are valid on blockchain!")
                print("   If they still show invalid in the UI:")
                print("   1. Check the frontend console (F12) for errors")
                print("   2. Check API response (Network tab)")
                print("   3. Restart the frontend: npm start")
            else:
                print("⚠️  Certificates are marked as invalid on blockchain")
                print("   Possible solutions:")
                print("   1. Issue new certificates")
                print("   2. Check smart contract state")
                print("   3. Verify blockchain connection")
                print("   4. Reset contract if needed")
        except Exception as e:
            print(f"Could not run recommendations: {e}")

except Exception as e:
    print(f"\n❌ DIAGNOSTIC FAILED: {str(e)}\n")
    import traceback
    traceback.print_exc()
    sys.exit(1)
