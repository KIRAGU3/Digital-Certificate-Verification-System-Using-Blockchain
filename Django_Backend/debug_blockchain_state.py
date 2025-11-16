#!/usr/bin/env python
"""
Deep dive debugging script - directly queries the blockchain contract
"""
import os
import sys
import django
from datetime import datetime
from web3 import Web3

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
django.setup()

from certificates.models import Certificate
from certificates.blockchain import web3, get_current_contract

def print_section(title):
    print(f"\n{'='*80}")
    print(f"  {title}")
    print('='*80)

def debug_blockchain_state():
    """Directly query blockchain state"""
    
    print_section("DIRECT BLOCKCHAIN STATE INSPECTION")
    
    if not web3:
        print("❌ Web3 not connected!")
        return False
    
    try:
        contract = get_current_contract()
    except Exception as e:
        print(f"❌ Failed to get contract: {e}")
        return False
    
    # Get all certificates from database
    certs = Certificate.objects.all().order_by('-id')[:3]
    
    if not certs:
        print("⚠️  No certificates in database")
        return False
    
    print(f"\n📊 Checking {len(certs)} recent certificates from database:\n")
    
    for i, cert in enumerate(certs, 1):
        print(f"{'─'*80}")
        print(f"Certificate #{i}")
        print(f"{'─'*80}")
        
        print(f"\n📋 Database Info:")
        print(f"  Hash: {cert.cert_hash}")
        print(f"  Student: {cert.student_name}")
        print(f"  Course: {cert.course}")
        print(f"  Institution: {cert.institution}")
        print(f"  Issue Date (DB): {cert.issue_date}")
        db_timestamp = int(cert.issue_date.timestamp())
        print(f"  Timestamp (DB): {db_timestamp}")
        
        # Try to query blockchain directly
        try:
            cert_hash_no_prefix = cert.cert_hash
            if cert_hash_no_prefix.startswith('0x'):
                cert_hash_no_prefix = cert_hash_no_prefix[2:]
            
            print(f"\n🔗 Blockchain Query:")
            print(f"  Converting hash: {cert_hash_no_prefix}")
            
            if len(cert_hash_no_prefix) != 64:
                print(f"  ❌ Invalid hash length: {len(cert_hash_no_prefix)} (expected 64)")
                continue
            
            cert_hash_bytes = bytes.fromhex(cert_hash_no_prefix)
            print(f"  Hash bytes: {cert_hash_bytes.hex()}")
            
            # Call the contract function directly
            print(f"\n  Calling contract.verifyCertificate()...")
            result = contract.functions.verifyCertificate(cert_hash_bytes).call()
            
            is_valid, student, course, institution, timestamp = result
            
            print(f"  ✅ Contract returned:")
            print(f"    - isValid: {is_valid}")
            print(f"    - Student: {student}")
            print(f"    - Course: {course}")
            print(f"    - Institution: {institution}")
            print(f"    - Timestamp: {timestamp}")
            if timestamp > 0:
                try:
                    date_str = datetime.utcfromtimestamp(timestamp)
                    print(f"    - Date: {date_str}")
                except:
                    print(f"    - Date: (conversion failed)")
            
            # Compare
            print(f"\n📊 Comparison:")
            
            match = True
            
            if is_valid:
                print(f"  ✅ isValid = True ✓")
            else:
                print(f"  ❌ isValid = False ✗✗✗ THIS IS THE PROBLEM!")
                match = False
            
            if student == cert.student_name:
                print(f"  ✅ Student matches: '{student}'")
            else:
                print(f"  ❌ Student mismatch:")
                print(f"     DB: '{cert.student_name}'")
                print(f"     BC: '{student}'")
                match = False
            
            if course == cert.course:
                print(f"  ✅ Course matches: '{course}'")
            else:
                print(f"  ❌ Course mismatch:")
                print(f"     DB: '{cert.course}'")
                print(f"     BC: '{course}'")
                match = False
            
            if institution == cert.institution:
                print(f"  ✅ Institution matches: '{institution}'")
            else:
                print(f"  ❌ Institution mismatch:")
                print(f"     DB: '{cert.institution}'")
                print(f"     BC: '{institution}'")
                match = False
            
            if timestamp == db_timestamp:
                print(f"  ✅ Timestamp matches: {timestamp}")
            else:
                print(f"  ❌ Timestamp mismatch:")
                print(f"     DB: {db_timestamp}")
                print(f"     BC: {timestamp}")
                match = False
            
            if not match:
                print(f"\n  🔴 CERTIFICATE DATA MISMATCH - Hash may not exist or be different!")
            
        except Exception as query_error:
            print(f"  ❌ Query failed: {str(query_error)}")
            if "Certificate not found" in str(query_error):
                print(f"\n  🔴 CRITICAL: Certificate hash not found on blockchain!")
                print(f"     The hash '{cert.cert_hash}' does not exist in the contract!")
            
        print()
    
    print_section("ANALYSIS COMPLETE")
    return True

def check_certificate_creation_logic():
    """Verify the hash creation logic"""
    print_section("CERTIFICATE HASH CREATION ANALYSIS")
    
    from certificates.blockchain import issue_certificate
    import time
    
    # Get the most recent certificate
    cert = Certificate.objects.all().order_by('-id').first()
    if not cert:
        print("⚠️  No certificates to analyze")
        return
    
    print(f"\n📋 Most Recent Certificate:")
    print(f"  Hash (from DB): {cert.cert_hash}")
    print(f"  Student: {cert.student_name}")
    print(f"  Course: {cert.course}")
    print(f"  Institution: {cert.institution}")
    print(f"  Timestamp: {int(cert.issue_date.timestamp())}")
    
    # Recalculate the hash
    print(f"\n🔄 Recalculating hash with same parameters:")
    
    student = cert.student_name
    course = cert.course
    institution = cert.institution
    timestamp = int(cert.issue_date.timestamp())
    
    calculated_hash = '0x' + Web3.solidity_keccak(
        ['string', 'string', 'string', 'uint256'],
        [student, course, institution, timestamp]
    ).hex()
    
    print(f"  Calculated hash: {calculated_hash}")
    print(f"  Stored hash:     {cert.cert_hash}")
    
    if calculated_hash.lower() == cert.cert_hash.lower():
        print(f"  ✅ Hashes match!")
    else:
        print(f"  ❌ Hashes DO NOT match!")
        print(f"\n  This means the hash stored in the database is different from")
        print(f"  what would be calculated from the certificate data.")
        print(f"  The blockchain won't find a certificate with the stored hash!")

if __name__ == "__main__":
    try:
        debug_blockchain_state()
        check_certificate_creation_logic()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
