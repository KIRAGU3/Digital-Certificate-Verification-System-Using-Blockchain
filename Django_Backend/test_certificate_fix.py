#!/usr/bin/env python
"""
Comprehensive test script to verify certificate issuance and verification works correctly.
This tests the fixes for the hash mismatch issue.
"""
import os
import sys
import django
import time
import json
from datetime import datetime, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
django.setup()

from certificates.blockchain import issue_certificate, verify_certificate_on_chain
from certificates.models import Certificate
from django.utils import timezone
from web3 import Web3

def test_certificate_flow():
    """Test the complete certificate issuance and verification flow"""
    
    print("\n" + "="*80)
    print("CERTIFICATE ISSUANCE AND VERIFICATION TEST")
    print("="*80)
    
    # Test data - use a date from today
    student_name = f"Test Student {int(time.time())}"
    course = "Blockchain Development"
    institution = "Tech University"
    
    # Use UTC midnight timestamp for consistency
    today = datetime.utcnow().date()
    issue_date_dt = datetime(today.year, today.month, today.day, 0, 0, 0)
    issue_date_timestamp = int(issue_date_dt.timestamp())
    
    print(f"\n📝 Test Certificate Details:")
    print(f"   Student: {student_name}")
    print(f"   Course: {course}")
    print(f"   Institution: {institution}")
    print(f"   Issue Date (UTC): {issue_date_dt}")
    print(f"   Timestamp: {issue_date_timestamp}")
    
    try:
        # ===== STEP 1: Issue Certificate =====
        print(f"\n{'='*80}")
        print("STEP 1: ISSUING CERTIFICATE")
        print('='*80)
        
        result = issue_certificate(student_name, course, institution, issue_date_timestamp)
        cert_hash = result['cert_hash']
        tx_hash = result.get('transaction_hash')
        
        print(f"✅ Certificate issued successfully!")
        print(f"   Certificate Hash: {cert_hash}")
        print(f"   Transaction Hash: {tx_hash}")
        
        # Validate cert_hash format
        if not cert_hash.startswith('0x'):
            print(f"❌ ERROR: Certificate hash should start with '0x', got: {cert_hash}")
            return False
        
        if len(cert_hash) != 66:  # 0x + 64 hex chars
            print(f"❌ ERROR: Certificate hash should be 66 chars (0x + 64 hex), got length: {len(cert_hash)}")
            return False
        
        print(f"✅ Certificate hash format is valid (66 chars, starts with 0x)")
        
        # ===== STEP 2: Create Database Record =====
        print(f"\n{'='*80}")
        print("STEP 2: CREATING DATABASE RECORD")
        print('='*80)
        
        issue_date_db = timezone.make_aware(datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0), timezone=timezone.utc)
        certificate = Certificate.objects.create(
            student_name=student_name,
            course=course,
            institution=institution,
            issue_date=issue_date_db,
            cert_hash=cert_hash
        )
        
        print(f"✅ Certificate record created in database")
        print(f"   Database ID: {certificate.id}")
        print(f"   Stored hash: {certificate.cert_hash}")
        
        # ===== STEP 3: Wait for transaction to be mined =====
        print(f"\n{'='*80}")
        print("STEP 3: WAITING FOR BLOCKCHAIN CONFIRMATION")
        print('='*80)
        
        print(f"   Waiting 3 seconds for transaction to be mined...")
        time.sleep(3)
        print(f"✅ Blockchain confirmation period completed")
        
        # ===== STEP 4: Verify Certificate =====
        print(f"\n{'='*80}")
        print("STEP 4: VERIFYING CERTIFICATE")
        print('='*80)
        
        print(f"   Attempting to verify hash: {cert_hash}")
        
        try:
            blockchain_result = verify_certificate_on_chain(cert_hash)
            if not blockchain_result:
                print(f"❌ VERIFICATION FAILED: Returned None")
                return False
            
            is_valid, returned_student, returned_course, returned_institution, returned_date = blockchain_result
            
            print(f"✅ Blockchain verification succeeded!")
            print(f"   Valid: {is_valid}")
            print(f"   Student: {returned_student}")
            print(f"   Course: {returned_course}")
            print(f"   Institution: {returned_institution}")
            print(f"   Timestamp: {returned_date}")
            
            # ===== STEP 5: Validate Results =====
            print(f"\n{'='*80}")
            print("STEP 5: VALIDATING RESULTS")
            print('='*80)
            
            all_valid = True
            
            # Check validity flag
            if not is_valid:
                print(f"❌ Certificate marked as invalid on blockchain")
                all_valid = False
            else:
                print(f"✅ Certificate marked as valid on blockchain")
            
            # Check student name
            if returned_student.strip() != student_name.strip():
                print(f"❌ Student name mismatch: expected '{student_name}', got '{returned_student}'")
                all_valid = False
            else:
                print(f"✅ Student name matches: {returned_student}")
            
            # Check course
            if returned_course.strip() != course.strip():
                print(f"❌ Course mismatch: expected '{course}', got '{returned_course}'")
                all_valid = False
            else:
                print(f"✅ Course matches: {returned_course}")
            
            # Check institution
            if returned_institution.strip() != institution.strip():
                print(f"❌ Institution mismatch: expected '{institution}', got '{returned_institution}'")
                all_valid = False
            else:
                print(f"✅ Institution matches: {returned_institution}")
            
            # Check timestamp
            if returned_date != issue_date_timestamp:
                print(f"❌ Timestamp mismatch: expected {issue_date_timestamp}, got {returned_date}")
                print(f"   Expected date: {datetime.utcfromtimestamp(issue_date_timestamp)}")
                print(f"   Actual date: {datetime.utcfromtimestamp(returned_date)}")
                all_valid = False
            else:
                print(f"✅ Timestamp matches: {returned_date} ({datetime.utcfromtimestamp(returned_date)})")
            
            if all_valid:
                print(f"\n{'='*80}")
                print("✅ ALL TESTS PASSED!")
                print("="*80)
                print(f"\nThe certificate was successfully issued and verified.")
                print(f"Hash: {cert_hash}")
                return True
            else:
                print(f"\n{'='*80}")
                print("❌ VALIDATION FAILED")
                print("="*80)
                return False
                
        except Exception as verify_error:
            print(f"❌ VERIFICATION FAILED WITH ERROR")
            print(f"   Error: {str(verify_error)}")
            import traceback
            traceback.print_exc()
            return False
            
    except Exception as e:
        print(f"\n❌ TEST FAILED WITH ERROR")
        print(f"   Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_hash_generation():
    """Test that hash generation is consistent"""
    print(f"\n{'='*80}")
    print("HASH GENERATION CONSISTENCY TEST")
    print("="*80)
    
    from web3 import Web3
    
    student_name = "Hash Test Student"
    course = "Test Course"
    institution = "Test Institution"
    issue_date = 1704067200  # 2024-01-01 00:00:00 UTC
    
    print(f"\nTest data:")
    print(f"  Student: {student_name}")
    print(f"  Course: {course}")
    print(f"  Institution: {institution}")
    print(f"  Timestamp: {issue_date}")
    
    # Generate hash using Web3.solidity_keccak (what Python code does)
    hash1 = '0x' + Web3.solidity_keccak(
        ['string', 'string', 'string', 'uint256'],
        [student_name, course, institution, issue_date]
    ).hex()
    
    # Generate again to verify consistency
    hash2 = '0x' + Web3.solidity_keccak(
        ['string', 'string', 'string', 'uint256'],
        [student_name, course, institution, issue_date]
    ).hex()
    
    print(f"\nGenerated hashes:")
    print(f"  Hash 1: {hash1}")
    print(f"  Hash 2: {hash2}")
    
    if hash1 == hash2:
        print(f"✅ Hash generation is consistent")
        return True
    else:
        print(f"❌ Hash generation is NOT consistent!")
        return False

def cleanup_test_certificates():
    """Clean up test certificates from database"""
    print(f"\n{'='*80}")
    print("CLEANUP")
    print('='*80)
    
    count = Certificate.objects.filter(student_name__startswith="Test Student").delete()[0]
    print(f"Cleaned up {count} test certificates from database")

if __name__ == "__main__":
    try:
        # Run tests
        print("\n🧪 Running Certificate Tests...\n")
        
        hash_test_passed = test_hash_generation()
        cert_test_passed = test_certificate_flow()
        
        cleanup_test_certificates()
        
        if hash_test_passed and cert_test_passed:
            print(f"\n{'='*80}")
            print("✅ ALL TESTS PASSED SUCCESSFULLY!")
            print("="*80)
            sys.exit(0)
        else:
            print(f"\n{'='*80}")
            print("❌ SOME TESTS FAILED")
            print("="*80)
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n⚠️ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
