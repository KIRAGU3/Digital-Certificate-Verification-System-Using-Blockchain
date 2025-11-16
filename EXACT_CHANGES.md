# Exact Code Changes - Line by Line

## File 1: Django_Backend/certificates/views.py

### Change 1: Added import
**Location**: Line 13
```python
# ADDED
import time
```

### Change 2: Updated IssueCertificateView.post() method
**Location**: Lines 176-223 (excerpt shown)

**OLD CODE**:
```python
# Try both camelCase and snake_case field names
student_name = request.data.get('studentName') or request.data.get('student_name')
course = request.data.get('course')
institution = request.data.get('institution')
issue_date = request.data.get('issueDate') or request.data.get('issue_date')
certificate_pdf = request.FILES.get('certificatePdf') or request.FILES.get('certificate_pdf')

print("Extracted fields:", {
    'student_name': student_name,
    'course': course,
    'institution': institution,
    'issue_date': issue_date,
    'has_pdf': bool(certificate_pdf)
})

# ... validation code ...

# Parse issue_date and convert to timezone-aware datetime
try:
    if not isinstance(issue_date, str):
        issue_date = issue_date.strftime('%Y-%m-%d') if hasattr(issue_date, 'strftime') else str(issue_date)
    parsed_date = datetime.strptime(issue_date, '%Y-%m-%d')
    parsed_date = parsed_date.replace(hour=12, minute=0, second=0, microsecond=0)
    aware_date = timezone.make_aware(parsed_date)
    issue_date_timestamp = int(aware_date.timestamp())
except (ValueError, TypeError) as e:
    return Response({'error': f'Invalid date format: {str(e)}. Expected format: YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST)
```

**NEW CODE**:
```python
# Try both camelCase and snake_case field names
student_name = request.data.get('studentName') or request.data.get('student_name')
course = request.data.get('course')
institution = request.data.get('institution')
issue_date = request.data.get('issueDate') or request.data.get('issue_date')
issue_date_timestamp = request.data.get('issueDateTimestamp') or request.data.get('issue_date_timestamp')
certificate_pdf = request.FILES.get('certificatePdf') or request.FILES.get('certificate_pdf')

print("Extracted fields:", {
    'student_name': student_name,
    'course': course,
    'institution': institution,
    'issue_date': issue_date,
    'issue_date_timestamp': issue_date_timestamp,
    'has_pdf': bool(certificate_pdf)
})

# ... validation code ...

# Parse issue_date and convert to timestamp
try:
    if not isinstance(issue_date, str):
        issue_date = issue_date.strftime('%Y-%m-%d') if hasattr(issue_date, 'strftime') else str(issue_date)
    
    # Try to use the timestamp from frontend if provided, otherwise calculate it
    if issue_date_timestamp:
        try:
            issue_date_timestamp = int(issue_date_timestamp)
            print(f"Using frontend-provided timestamp: {issue_date_timestamp}")
        except (ValueError, TypeError):
            print(f"Invalid timestamp from frontend: {issue_date_timestamp}, calculating from date")
            issue_date_timestamp = None
    
    if not issue_date_timestamp:
        # Calculate timestamp from date string at midnight UTC
        # This ensures consistent hash generation across timezones
        parsed_date = datetime.strptime(issue_date, '%Y-%m-%d')
        parsed_date = parsed_date.replace(hour=0, minute=0, second=0, microsecond=0)
        # Use UTC timezone explicitly
        from django.utils.timezone import make_aware, utc
        aware_date = timezone.make_aware(parsed_date, timezone=utc)
        issue_date_timestamp = int(aware_date.timestamp())
        print(f"Calculated timestamp from date: {issue_date_timestamp}")
    
    # Verify the timestamp is reasonable
    current_time = int(time.time())
    one_day_in_seconds = 24 * 60 * 60
    if issue_date_timestamp > current_time + one_day_in_seconds:
        return Response({'error': 'Issue date cannot be in the future'},
                        status=status.HTTP_400_BAD_REQUEST)
    if issue_date_timestamp < 946684800:  # Jan 1, 2000
        return Response({'error': 'Issue date seems too old (before year 2000)'},
                        status=status.HTTP_400_BAD_REQUEST)
        
except (ValueError, TypeError) as e:
    return Response({'error': f'Invalid date format: {str(e)}. Expected format: YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST)
```

---

## File 2: Django_Backend/certificates/blockchain.py

### Change 1: Updated issue_certificate() method
**Location**: Lines 216-272 (excerpt)

**OLD CODE**:
```python
# Store certificate on blockchain with correct parameter order
tx_hash = contract.functions.issueCertificate(
    student_name,  # string _studentName
    course,        # string _course
    institution,   # string _institution
    issue_date    # uint256 _issueDate
).transact({'from': account})

print(f"Transaction sent with hash: {tx_hash.hex()}")

# Wait for transaction to be mined
print("Waiting for transaction to be mined...")
tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

if tx_receipt.status != 1:
    raise SmartContractError(f"Transaction failed. Receipt status: {tx_receipt.status}")

# Log successful transaction
print(f"Certificate issued successfully. Transaction hash: {tx_hash.hex()}")
print(f"Block number: {tx_receipt.blockNumber}")
print(f"Gas used: {tx_receipt.gasUsed}")
```

**NEW CODE**:
```python
# Store certificate on blockchain with correct parameter order
tx_hash = contract.functions.issueCertificate(
    student_name,  # string _studentName
    course,        # string _course
    institution,   # string _institution
    issue_date    # uint256 _issueDate
).transact({'from': account})

print(f"Transaction sent with hash: {tx_hash.hex()}")

# Wait for transaction to be mined
print("Waiting for transaction to be mined...")
tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

if tx_receipt.status != 1:
    raise SmartContractError(f"Transaction failed. Receipt status: {tx_receipt.status}")

# Extract the actual certificate hash from the contract event
try:
    if tx_receipt.logs:
        # Decode the event from the logs
        event_logs = contract.events.CertificateIssued().process_receipt(tx_receipt)
        if event_logs:
            actual_cert_hash = event_logs[0]['args']['certHash']
            actual_cert_hash = '0x' + actual_cert_hash.hex() if not isinstance(actual_cert_hash, str) else actual_cert_hash
            if not actual_cert_hash.startswith('0x'):
                actual_cert_hash = '0x' + actual_cert_hash
            
            # Verify the event hash matches our pre-calculated hash
            if actual_cert_hash.lower() != cert_hash.lower():
                print(f"Warning: Pre-calculated hash ({cert_hash}) differs from event hash ({actual_cert_hash})")
                # Use the actual event hash to be safe
                cert_hash = actual_cert_hash
            else:
                print(f"Verified: Pre-calculated hash matches event hash: {cert_hash}")
        else:
            print("Warning: No CertificateIssued event found in transaction receipt")
    else:
        print("Warning: No logs found in transaction receipt")
except Exception as e:
    print(f"Warning: Could not extract hash from event: {str(e)}. Using pre-calculated hash.")

# Log successful transaction
print(f"Certificate issued successfully. Transaction hash: {tx_hash.hex()}")
print(f"Certificate hash: {cert_hash}")
print(f"Block number: {tx_receipt.blockNumber}")
print(f"Gas used: {tx_receipt.gasUsed}")
```

### Change 2: Updated verify_certificate_on_chain() method
**Location**: Lines 295-327 (excerpt)

**OLD CODE**:
```python
try:
    print(f"Attempting to verify certificate hash: {cert_hash}")
    
    # Convert the hash to bytes32 format
    if cert_hash.startswith('0x'):
        cert_hash = cert_hash[2:]  # Remove '0x' prefix if present
    
    print(f"Formatted hash for verification: {cert_hash}")
        
    # Convert hex string to bytes32
    try:
        cert_hash_bytes = Web3.to_bytes(hexstr=cert_hash)
        print(f"Converted hash to bytes: {cert_hash_bytes.hex()}")
    except Exception as e:
        print(f"Error converting hash to bytes: {str(e)}")
        raise SmartContractError(f"Invalid certificate hash format: {str(e)}")
```

**NEW CODE**:
```python
try:
    print(f"Attempting to verify certificate hash: {cert_hash}")
    
    # Convert the hash to bytes32 format
    if cert_hash.startswith('0x'):
        cert_hash = cert_hash[2:]  # Remove '0x' prefix if present
    
    print(f"Formatted hash for verification: {cert_hash}")
    
    # Ensure hash is exactly 64 hex characters (32 bytes)
    if len(cert_hash) != 64:
        raise SmartContractError(f"Invalid certificate hash length: expected 64 hex chars, got {len(cert_hash)}")
        
    # Convert hex string to bytes32
    try:
        # Pad with zeros if needed and convert to bytes
        cert_hash_bytes = bytes.fromhex(cert_hash)
        if len(cert_hash_bytes) != 32:
            raise ValueError(f"Hash must be exactly 32 bytes, got {len(cert_hash_bytes)}")
        print(f"Converted hash to bytes: {cert_hash_bytes.hex()}")
    except Exception as e:
        print(f"Error converting hash to bytes: {str(e)}")
        raise SmartContractError(f"Invalid certificate hash format: {str(e)}")
```

---

## File 3: certificate-verification-frontend/src/components/CertificateForm.js

### Change: Updated handleSubmit() method
**Location**: Lines 37-45

**OLD CODE**:
```javascript
// Send both formatted date and timestamp
const dateObj = new Date(formData.issueDate);
const formattedDate = dateObj.toISOString().split('T')[0];
const timestamp = Math.floor(dateObj.getTime() / 1000);
data.append('issueDate', formattedDate);
data.append('issueDateTimestamp', timestamp);
```

**NEW CODE**:
```javascript
// Send both formatted date and timestamp
const dateObj = new Date(formData.issueDate + 'T00:00:00Z');  // Parse as UTC midnight
const formattedDate = formData.issueDate;  // Use the date string directly
const timestamp = Math.floor(dateObj.getTime() / 1000);  // Convert to seconds
data.append('issueDate', formattedDate);
data.append('issueDateTimestamp', timestamp);
```

---

## Summary of Changes

### Views.py
- 1 line added (import time)
- 13 lines modified (better timestamp handling)
- Net change: ~13 lines

### Blockchain.py
- 0 imports added
- 34 lines modified/added (event hash extraction + hash validation)
- Net change: ~34 lines

### CertificateForm.js
- 0 imports added
- 3 lines modified (UTC midnight parsing)
- Net change: ~3 lines

**Total net changes: ~50 lines across 3 files**

---

## Change Categories

| Category | Before | After | Reason |
|----------|--------|-------|--------|
| **Timestamp Handling** | Ignored frontend value, hardcoded noon | Uses frontend value, or calculates UTC midnight | Consistency |
| **Hash Extraction** | Pre-calculated only | Extracted from event + pre-calculated | Verification |
| **Hash Validation** | None | Validates length and format | Robustness |
| **Date Parsing** | Local timezone | UTC midnight explicit | Consistency |

---

## Verification

To verify these exact changes were applied:

```bash
# Check imports
grep "^import time" Django_Backend/certificates/views.py

# Check timestamp extraction
grep "issueDateTimestamp" Django_Backend/certificates/views.py

# Check event extraction
grep "CertificateIssued" Django_Backend/certificates/blockchain.py

# Check hash validation
grep "len(cert_hash) != 64" Django_Backend/certificates/blockchain.py

# Check date parsing
grep "T00:00:00Z" certificate-verification-frontend/src/components/CertificateForm.js
```

All should return results indicating the changes are in place.

---

**Changes Summary**: ✅ COMPLETE
**Lines Changed**: ~50
**Files Modified**: 3
**Risk Level**: LOW
**Testing**: Required
**Rollback**: Easy
