import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
django.setup()

from certificates.blockchain import get_web3, get_current_contract
from web3 import Web3

try:
    # Connect to blockchain
    web3 = get_web3()
    print(f"✅ Connected to blockchain")
    print(f"Current block: {web3.eth.block_number}")
    print(f"Network ID: {web3.net.version}")
    
    # Get contract
    contract = get_current_contract()
    print(f"✅ Contract loaded")
    print(f"Contract address: {contract.address}")
    
    # Check a specific certificate hash
    from certificates.models import Certificate
    cert = Certificate.objects.filter(student_name='KIRAGU').order_by('-id').first()
    
    cert_hash_bytes = bytes.fromhex(cert.cert_hash[2:])  # Remove 0x
    
    print(f"\nTrying to verify certificate on blockchain:")
    print(f"Hash: {cert.cert_hash}")
    
    try:
        result = contract.functions.verifyCertificate(cert_hash_bytes).call()
        is_valid, student_name, course, institution, issue_date = result
        print(f"✅ Certificate FOUND on blockchain!")
        print(f"Valid: {is_valid}")
        print(f"Student: {student_name}")
        print(f"Course: {course}")
        print(f"Institution: {institution}")
        print(f"Issue Date: {issue_date}")
    except Exception as e:
        print(f"❌ Certificate NOT FOUND on blockchain")
        print(f"Error: {str(e)}")
        
        # Try to check contract events
        print("\n\nChecking contract events...")
        events = contract.events.CertificateIssued.get_logs(from_block=0)
        print(f"Total CertificateIssued events: {len(events)}")
        
        if events:
            for i, event in enumerate(events[-3:]):  # Show last 3
                args = event['args']
                print(f"\nEvent {i+1}:")
                print(f"  Hash: {args['certHash'].hex()}")
                print(f"  Student: {args['studentName']}")
                print(f"  Course: {args['course']}")
                
except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
