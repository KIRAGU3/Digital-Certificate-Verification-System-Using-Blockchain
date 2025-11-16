# API Examples - issue and verify certificates

Assumes Django backend running at http://127.0.0.1:8000

1) Issue certificate (multipart form data)

curl -X POST "http://127.0.0.1:8000/api/certificates/issue/" \
  -H "Accept: application/json" \
  -F "studentName=Jane Doe" \
  -F "course=Computer Science" \
  -F "institution=Tech University" \
  -F "issueDate=2025-09-05" \
  -F "certificatePdf=@/path/to/certificate.pdf" 

Response (example):
{
  "cert_hash": "0x...",
  "ipfs_hash": null,
  "transaction_hash": "0x..."
}

2) Verify certificate by hash

curl -X GET "http://127.0.0.1:8000/api/certificates/verify/0x<cert_hash>/" -H "Accept: application/json"

Response (example):
{
  "is_valid": true,
  "student_name": "Jane Doe",
  "course": "Computer Science",
  "institution": "Tech University",
  "issue_date": 1693910400
}

Notes:
- If your Django `BLOCKCHAIN_URL` or `CONTRACT_ADDRESS` are different, set them in `Django_Backend/.env` or as environment variables before starting Django.
- The `issueDate` can be a string in YYYY-MM-DD format; the backend converts it to a unix timestamp.
- If the contract reverts with "Certificate already exists!", the backend will raise an error and transaction will not be stored.
