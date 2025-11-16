import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
django.setup()

from certificates.models import Certificate
from certificates.blockchain import verify_certificate_on_chain

# Get the latest KIRAGU certificate 
cert = Certificate.objects.filter(student_name='KIRAGU').order_by('-id').first()

print(f"Testing certificate: {cert.student_name}")
print(f"Hash: {cert.cert_hash}")
print(f"Course: {cert.course}")
print(f"Institution: {cert.institution}")
print(f"Issue Date: {cert.issue_date}")

try:
    result = verify_certificate_on_chain(cert.cert_hash)
    print(f"\n✅ FOUND on blockchain!")
    is_valid, student, course, institution, issue_date = result
    print(f"Valid: {is_valid}")
    print(f"Student: {student}")
    print(f"Course: {course}")
    print(f"Institution: {institution}")
    print(f"Issue Date: {issue_date}")
except Exception as e:
    print(f"\n❌ NOT found on blockchain: {e}")
