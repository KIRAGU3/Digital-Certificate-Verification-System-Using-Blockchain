#!/usr/bin/env python
"""
Diagnostic script to check what certificates exist on the blockchain
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from certificates.models import Certificate
from certificates.blockchain import web3, get_current_contract, verify_certificate_on_chain
from web3 import Web3

def check_certificates():
    """Check database certificates and their blockchain status"""
    
    print("=" * 80)
    print("CHECKING CERTIFICATES IN DATABASE AND BLOCKCHAIN")
    print("=" * 80)
    
    # Get all certificates from database
    certs = Certificate.objects.all()
    print(f"\nTotal certificates in database: {certs.count()}\n")
    
    for cert in certs:
        print(f"\nDATABASE CERTIFICATE:")
        print(f"  Student: {cert.student_name}")
        print(f"  Course: {cert.course}")
        print(f"  Institution: {cert.institution}")
        print(f"  Issue Date: {cert.issue_date}")
        print(f"  Hash: {cert.cert_hash}")
        print(f"  Revoked: {cert.is_revoked}")
        
        # Try to verify on blockchain
        try:
            result = verify_certificate_on_chain(cert.cert_hash)
            print(f"  ✅ FOUND ON BLOCKCHAIN")
            print(f"     Is Valid: {result[0]}")
            print(f"     Student (chain): {result[1]}")
            print(f"     Course (chain): {result[2]}")
            print(f"     Institution (chain): {result[3]}")
            print(f"     Issue Date (chain): {result[4]}")
        except Exception as e:
            print(f"  ❌ NOT FOUND ON BLOCKCHAIN")
            print(f"     Error: {str(e)}")
            
            # Try to verify with manually calculated hash
            from certificates.blockchain import issue_certificate
            try:
                print(f"\n     Attempting to recalculate hash...")
                cert_hash = '0x' + Web3.solidity_keccak(
                    ['string', 'string', 'string', 'uint256'],
                    [cert.student_name, cert.course, cert.institution, int(cert.issue_date.timestamp())]
                ).hex()
                print(f"     Calculated hash: {cert_hash}")
                
                if cert_hash.lower() != cert.cert_hash.lower():
                    print(f"     ⚠️  HASH MISMATCH!")
                    print(f"        Database hash: {cert.cert_hash}")
                    print(f"        Calculated hash: {cert_hash}")
                    
                    # Try verifying with calculated hash
                    result = verify_certificate_on_chain(cert_hash)
                    print(f"     ✅ FOUND with recalculated hash")
                else:
                    print(f"     ✓ Hashes match")
                    
            except Exception as e2:
                print(f"     Hash recalculation error: {str(e2)}")
    
    print("\n" + "=" * 80)
    print("CHECK COMPLETE")
    print("=" * 80)

if __name__ == '__main__':
    check_certificates()
