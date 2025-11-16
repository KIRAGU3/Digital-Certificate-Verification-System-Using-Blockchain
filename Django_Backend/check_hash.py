import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
django.setup()

from certificates.models import Certificate
from web3 import Web3
from datetime import datetime

# Get the latest KIRAGU certificate 
cert = Certificate.objects.filter(student_name='KIRAGU').order_by('-id').first()

if not cert:
    print("No certificate found")
    sys.exit(1)

print(f"Certificate Hash (from DB): {cert.cert_hash}")
print(f"Student: {cert.student_name}")
print(f"Course: {cert.course}")  
print(f"Institution: {cert.institution}")
print(f"Issue Date (DB): {cert.issue_date}")
print(f"Issue Date (timestamp): {int(cert.issue_date.timestamp())}")

# Now recalculate the hash the same way blockchain does
issue_date_timestamp = int(cert.issue_date.timestamp())
calculated_hash = '0x' + Web3.solidity_keccak(
    ['string', 'string', 'string', 'uint256'],
    [cert.student_name, cert.course, cert.institution, issue_date_timestamp]
).hex()

print(f"\nCalculated Hash: {calculated_hash}")
print(f"Hashes Match: {calculated_hash.lower() == cert.cert_hash.lower()}")

if calculated_hash.lower() != cert.cert_hash.lower():
    print("\n⚠️ HASH MISMATCH DETECTED!")
    print(f"DB Hash:        {cert.cert_hash.lower()}")
    print(f"Calculated:     {calculated_hash.lower()}")
