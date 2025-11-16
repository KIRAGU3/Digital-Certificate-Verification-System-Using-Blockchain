import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
django.setup()

from certificates.blockchain import issue_certificate
from datetime import datetime

# Test issuing a certificate
try:
    print("Calling issue_certificate...")
    result = issue_certificate(
        student_name="Test Debug",
        course="test course",
        institution="test institution",
        issue_date=int(datetime(2025, 11, 14).timestamp())
    )
    print(f"\n✅ SUCCESS: {result}")
    
    # Now check if it's on blockchain
    from certificates.blockchain import verify_certificate_on_chain
    try:
        verify_result = verify_certificate_on_chain(result['cert_hash'])
        print(f"✅ Verification: {verify_result}")
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
