# 🔍 QR CODE UPLOAD DEBUGGING GUIDE

## Quick Troubleshooting Checklist

### ✅ Step 1: Verify Certificate Was Issued with QR
```
1. Go to http://localhost:3000/issue
2. Fill out the form and submit
3. Look for a QR code in the success section
4. If you see it, take a screenshot or save the QR code image
```

### ✅ Step 2: Open Browser Console for Errors
```
1. Press F12 to open Developer Tools
2. Click the "Console" tab
3. Try uploading QR code again
4. Look for red error messages
5. Share those errors with me
```

### ✅ Step 3: Check Network Request
```
1. In Developer Tools, click "Network" tab
2. Try uploading QR code
3. Look for a request to "verify-qr/"
4. Click on it and check:
   - Request body (should have qr_image file)
   - Response (should show certificate data or error)
5. Share the response with me
```

### ✅ Step 4: Check Backend Logs
```
The Django terminal should show:
- POST /api/certificates/verify-qr/
- Response status (200, 400, 500, etc.)
- Any error messages

Share these logs with me
```

---

## Common Issues & Solutions

### Issue 1: "Failed to verify QR code"
**Possible Causes:**
- QR code file is not valid
- Backend can't decode the image
- Certificate doesn't exist in database

**Solution:**
```
1. Make sure you're uploading a .png or .jpg image
2. Make sure the image contains a QR code
3. Make sure certificate was issued first
```

### Issue 2: "Certificate not found"
**Possible Causes:**
- Certificate exists on blockchain but not in database
- Hash mismatch between QR and database

**Solution:**
```
1. Issue a new certificate
2. Wait for database to update
3. Use that certificate's QR code
```

### Issue 3: Upload button not responding
**Possible Causes:**
- Frontend JavaScript error
- Backend not running
- CORS issue

**Solution:**
```
1. Check backend is running (Django terminal)
2. Open console (F12) and look for errors
3. Verify API URL: should be http://localhost:8000
```

### Issue 4: "Could not decode certificate hash from QR code"
**Possible Causes:**
- QR image is corrupted
- pyzbar library not working
- Wrong image file

**Solution:**
```
1. Try with different QR code image
2. Make sure Pillow and pyzbar are installed:
   python -m pip list | findstr "pyzbar Pillow"
```

---

## Manual Testing

### Test 1: Direct API Call
```bash
# After issuing a certificate, try this directly:
# Replace with actual certificate hash

curl -X POST http://localhost:8000/api/certificates/verify-qr/ \
  -F "qr_image=@/path/to/qr_code.png"

# You should get back certificate data and blockchain verification
```

### Test 2: Check QR Generator
```bash
# In Django terminal, run:
python manage.py shell

# Then:
from certificates.qr_generator import generate_qr_code, decode_qr_code_hash
from certificates.models import Certificate

# Get a certificate
cert = Certificate.objects.first()

# Generate QR
qr = generate_qr_code(cert.cert_hash)
print(f"QR generated: {qr.name}")

# Try to decode it back
decoded = decode_qr_code_hash(qr)
print(f"Decoded hash: {decoded}")
print(f"Original hash: {cert.cert_hash}")
```

---

## Information I Need

Please provide:

1. **Console Error Messages** (F12 → Console tab)
2. **Network Response** (F12 → Network tab → verify-qr)
3. **Django Terminal Logs** (from backend)
4. **Screenshots** of:
   - The QR code that was generated
   - The error message you're seeing
   - The upload interface

---

## Still Having Issues?

Run the diagnostic script:
```bash
cd c:\certificate-verification-system\Django_Backend
python diagnose_qr.py
```

This will check:
- ✅ qrcode library installed
- ✅ pyzbar library installed
- ✅ Pillow library installed
- ✅ Database connection
- ✅ Certificate table
- ✅ QR code files exist
- ✅ Can generate QR
- ✅ Can decode QR

---

## Video of Expected Flow

**Correct Flow:**
1. Issue Certificate → See QR code ✅
2. Save/screenshot the QR code
3. Go to Verify page
4. Click "Upload QR Image" tab
5. Drag-drop or select the QR image
6. System shows "Loading..." spinner
7. Certificate details appear with ✅ verification status

**What should NOT happen:**
- ❌ Red error message
- ❌ Page freeze/hang
- ❌ No response
- ❌ 404/500 errors

---

**Share your error details and I'll fix it immediately!** 🚀
