#!/usr/bin/env python
"""
Diagnostic script to debug certificate verification issues.
Checks database, blockchain, and hash calculations.
"""
import os
import sys
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
django.setup()

from certificates.models import Certificate
from certificates.blockchain import verify_certificate_on_chain, web3, get_current_contract
from web3 import Web3

def print_section(title):
    print(f"\n{'='*80}")
    print(f"  {title}")
    print('='*80)

def diagnose():
    """Run comprehensive diagnostics"""
    
    print_section("CERTIFICATE VERIFICATION DIAGNOSTICS")
    
    # 1. Check database certificates
    print("\n📊 DATABASE CERTIFICATES:")
    certs = Certificate.objects.all().order_by('-id')[:5]
    
    if not certs:
        print("⚠️  No certificates found in database!")
        return False
    
    for cert in certs:
        print(f"\n  ID: {cert.id}")
        print(f"  Student: {cert.student_name}")
        print(f"  Hash: {cert.cert_hash}")
        print(f"  Issue Date: {cert.issue_date}")
        print(f"  Is Revoked: {cert.is_revoked}")
        print(f"  Created: {cert.created_at}")
    
    # 2. Test verification on most recent certificate
    print_section("TESTING MOST RECENT CERTIFICATE")
    latest_cert = certs[0]
    
    print(f"\n📋 Certificate Details:")
    print(f"  Hash: {latest_cert.cert_hash}")
    print(f"  Student: {latest_cert.student_name}")
    print(f"  Course: {latest_cert.course}")
    print(f"  Institution: {latest_cert.institution}")
    print(f"  Timestamp (DB): {latest_cert.issue_date}")
    
    # 3. Try verification
    print(f"\n🔍 Attempting verification...")
    try:
        result = verify_certificate_on_chain(latest_cert.cert_hash)
        if result:
            is_valid, student, course, institution, issue_date = result
            print(f"✅ Verification succeeded!")
            print(f"\n  Blockchain Data:")
            print(f"    Valid: {is_valid}")
            print(f"    Student: {student}")
            print(f"    Course: {course}")
            print(f"    Institution: {institution}")
            print(f"    Timestamp: {issue_date}")
            print(f"    Date: {datetime.utcfromtimestamp(issue_date)}")
            
            # 4. Compare data
            print(f"\n📊 COMPARISON:")
            
            if student.strip() != latest_cert.student_name:
                print(f"  ❌ Student mismatch: DB='{latest_cert.student_name}' vs Blockchain='{student}'")
            else:
                print(f"  ✅ Student matches")
            
            if course.strip() != latest_cert.course:
                print(f"  ❌ Course mismatch: DB='{latest_cert.course}' vs Blockchain='{course}'")
            else:
                print(f"  ✅ Course matches")
            
            if institution.strip() != latest_cert.institution:
                print(f"  ❌ Institution mismatch: DB='{latest_cert.institution}' vs Blockchain='{institution}'")
            else:
                print(f"  ✅ Institution matches")
            
            db_timestamp = int(latest_cert.issue_date.timestamp())
            if db_timestamp != issue_date:
                print(f"  ❌ Timestamp mismatch:")
                print(f"     DB: {db_timestamp} ({latest_cert.issue_date})")
                print(f"     Blockchain: {issue_date} ({datetime.utcfromtimestamp(issue_date)})")
            else:
                print(f"  ✅ Timestamp matches")
            
            if is_valid:
                print(f"\n✅ Certificate is valid on blockchain!")
            else:
                print(f"\n❌ Certificate is INVALID on blockchain!")
                return False
        else:
            print(f"❌ Verification returned None")
            return False
            
    except Exception as e:
        print(f"❌ Verification error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    # 5. Check blockchain connection
    print_section("BLOCKCHAIN CONNECTION CHECK")
    
    if web3:
        print(f"✅ Web3 connected")
        print(f"  Block Number: {web3.eth.block_number}")
        print(f"  Chain ID: {web3.eth.chain_id}")
    else:
        print(f"❌ Web3 not connected")
        return False
    
    # 6. Check contract
    print_section("SMART CONTRACT CHECK")
    try:
        contract = get_current_contract()
        print(f"✅ Contract initialized")
        print(f"  Has issueCertificate: {hasattr(contract.functions, 'issueCertificate')}")
        print(f"  Has verifyCertificate: {hasattr(contract.functions, 'verifyCertificate')}")
    except Exception as e:
        print(f"❌ Contract error: {str(e)}")
        return False
    
    print_section("DIAGNOSTICS COMPLETE")
    print(f"\n✅ All checks passed!" if is_valid else f"\n❌ Issues found - see above")
    
    return is_valid

if __name__ == "__main__":
    try:
        success = diagnose()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Diagnostic failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
