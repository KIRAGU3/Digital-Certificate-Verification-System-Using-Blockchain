# QR Code Feature - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies

#### Backend (Django)
```powershell
cd Django_Backend
python -m pip install qrcode[pil] pyzbar pillow -q
python manage.py migrate
```

#### Frontend (React)
```powershell
cd certificate-verification-frontend
npm install jsqr qrcode
npm start
```

### Step 2: Verify Installation

Backend should create media directory:
```
Django_Backend/media/qr_codes/
```

### Step 3: Test QR Code Generation

1. **Start Django:**
   ```powershell
   cd Django_Backend
   python manage.py runserver
   ```

2. **Start React:**
   ```powershell
   cd certificate-verification-frontend
   npm start
   ```

3. **Issue a Certificate:**
   - Go to "Issue Certificate" page
   - Fill in the form with test data
   - Submit
   - ✓ You should see a QR code displayed!

## 🎯 Key Features Now Enabled

### ✅ Feature 1: Automatic QR Code Generation
When issuing a certificate:
- QR code is automatically generated
- Saved to database
- Returned in API response
- Displayed to user

### ✅ Feature 2: QR Code Scanning
Users can verify certificates by:
- **Method 1:** Scanning with camera
  - Open Verify page
  - Click "QR Code" → "Scan with Camera"
  - Point camera at QR code
  - Automatic verification!

- **Method 2:** Upload QR image
  - Open Verify page
  - Click "QR Code" → "Upload QR Image"
  - Drag and drop or select file
  - Automatic verification!

### ✅ Feature 3: Manual Verification (Fallback)
- Users can still enter hash manually
- Available on same verification page

## 📱 How It Works

### Certificate Issuance Flow
```
User submits form
        ↓
Django processes certificate
        ↓
Smart contract issues on blockchain
        ↓
QR code generated from certificate hash
        ↓
QR code stored in database
        ↓
URL returned to frontend
        ↓
QR code displayed to user
```

### Certificate Verification Flow (QR Scan)
```
User scans QR code with phone camera
        ↓
jsQR library decodes QR on frontend
        ↓
Certificate hash extracted
        ↓
Sent to backend for verification
        ↓
Backend checks blockchain
        ↓
Results returned (Valid/Invalid)
        ↓
Displayed to user
```

### Certificate Verification Flow (Image Upload)
```
User uploads QR image
        ↓
Sent to backend
        ↓
pyzbar decodes QR image
        ↓
Certificate hash extracted
        ↓
Backend checks blockchain
        ↓
Results returned (Valid/Invalid)
        ↓
Displayed to user
```

## 🧪 Testing QR Code Feature

### Test 1: Generate QR Code
```powershell
cd Django_Backend
python
```
```python
from certificates.qr_generator import generate_qr_code
qr = generate_qr_code('0x1234567890abcdef...')
print("QR generated:", qr.size, "bytes")
```

### Test 2: Issue Certificate
```bash
curl -X POST http://localhost:8000/api/certificates/issue/ \
  -F "studentName=John Doe" \
  -F "course=Python" \
  -F "institution=Tech Academy" \
  -F "issueDate=2024-11-11" \
  -F "certificatePdf=@certificate.pdf"
```

### Test 3: Verify by QR Code
1. Upload QR image:
```bash
curl -X POST http://localhost:8000/api/certificates/verify-qr/ \
  -F "qr_image=@qr_code.png"
```

## 🐛 Troubleshooting

### Issue: "QR code not displaying after issuance"
**Solution:**
1. Check that `media/qr_codes/` directory exists
2. Verify Pillow is installed: `pip show Pillow`
3. Check Django logs for errors

### Issue: "Camera not working on Verify page"
**Solution:**
1. Ensure HTTPS or localhost (browser security)
2. Check browser permissions for camera access
3. Try different browser
4. Fall back to image upload method

### Issue: "QR scanning not working"
**Solution:**
1. Verify jsQR is loaded: Check console for `window.jsQR`
2. Test with different QR code image
3. Try uploading QR image instead
4. Check browser compatibility

### Issue: "ModuleNotFoundError: No module named 'qrcode'"
**Solution:**
```powershell
pip install qrcode[pil] -U
```

### Issue: "pyzbar not decoding QR images"
**Solution:**
1. On Windows: Install zbar from http://zbar.sourceforge.net/
2. On Mac: `brew install zbar`
3. On Linux: `apt-get install libzbar0`
4. Then: `pip install pyzbar --upgrade`

## 📊 File Structure

```
certificate-verification-system/
├── Django_Backend/
│   ├── certificates/
│   │   ├── qr_generator.py          ← QR generation/decoding logic
│   │   ├── models.py                ← Updated with qr_code field
│   │   ├── views.py                 ← Updated endpoints
│   │   ├── urls.py                  ← New verify-qr endpoint
│   │   ├── test_qr_code.py          ← QR tests
│   │   └── migrations/0006_...      ← Database migration
│   ├── setup_qr_feature.py          ← Setup script
│   ├── requirements.txt             ← Python dependencies
│   └── media/qr_codes/              ← Generated QR codes
│
├── certificate-verification-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QRCodeVerification.js    ← New QR component
│   │   │   ├── QRCodeVerification.css   ← New QR styles
│   │   │   ├── CertificateForm.js       ← Updated with QR display
│   │   │   └── CertificateForm.css      ← Updated with QR styles
│   │   ├── pages/
│   │   │   └── VerifyCertificate.js     ← Updated with QR component
│   │   └── services/
│   │       └── certificateService.js    ← Already supports new endpoints
│   ├── public/
│   │   └── index.html               ← Added jsQR CDN link
│   └── package.json                 ← Updated dependencies
│
└── QR_CODE_VERIFICATION_GUIDE.md    ← Comprehensive documentation
```

## 🚀 Next Steps

1. **Test the complete flow:**
   - Issue a certificate
   - See QR code displayed
   - Scan QR code with camera
   - Verify certificate displays correctly

2. **Customize QR appearance (optional):**
   - Edit `certificates/qr_generator.py`
   - Adjust QR size, colors, error correction

3. **Add more features (optional):**
   - Download QR code as image
   - Print QR codes
   - Share QR codes on social media

## 📞 Support

For detailed information, see: `QR_CODE_VERIFICATION_GUIDE.md`

For issues:
1. Check Django logs: `python manage.py runserver`
2. Check browser console: F12 → Console
3. Verify all dependencies: `pip list`
4. Run tests: `python manage.py test certificates.test_qr_code`

## ✨ Summary

You now have:
✅ Automatic QR code generation on certificate issuance
✅ QR code storage in database
✅ QR code display on issuance page
✅ Camera-based QR scanning for verification
✅ Image upload-based QR verification
✅ Fallback manual hash entry
✅ Full documentation and tests

Enjoy your enhanced certificate verification system! 🎉
