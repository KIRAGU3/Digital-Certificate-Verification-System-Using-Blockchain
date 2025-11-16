# 🚀 Quick Reference Guide

## ⚡ Quick Start

### One Command to Start Everything:
```powershell
cd c:\certificate-verification-system
.\run-all.ps1
```

This opens 4 windows automatically:
1. Ganache (blockchain)
2. Truffle (deploy contracts)
3. Django (API)
4. React (frontend)

### Then Access:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Blockchain**: http://localhost:8545 (RPC endpoint)

---

## 🧪 Testing Commands

### Test Hash Generation:
```bash
cd c:\certificate-verification-system\Django_Backend
python debug_blockchain_state.py
```

### Full Certificate Test:
```bash
cd c:\certificate-verification-system\Django_Backend
python test_certificate_fix.py
```

### Check Contract Deployment:
```bash
cd c:\certificate-verification-system\Django_Backend
python check_contract_deployment.py
```

### Diagnose Issues:
```bash
cd c:\certificate-verification-system\Django_Backend
python diagnose_cert_issue.py
```

---

## 📝 Manual Testing (via cURL)

### Issue a Certificate:
```bash
curl -X POST http://localhost:8000/api/certificates/issue/ \
  -F "studentName=John Doe" \
  -F "course=Python 101" \
  -F "institution=Tech University" \
  -F "issueDate=2025-11-11" \
  -F "certificatePdf=@certificate.pdf"
```

### Verify a Certificate:
```bash
curl -X GET "http://localhost:8000/api/certificates/verify/0x<HASH>/"
```

Replace `<HASH>` with actual certificate hash.

---

## 🐛 Troubleshooting Quick Fixes

### Port Already in Use
```powershell
netstat -ano | findstr :8545
taskkill /PID <PID> /F
```

### Django Not Starting
```bash
cd Django_Backend
python manage.py migrate
python manage.py runserver
```

### Frontend Won't Compile
```bash
cd certificate-verification-frontend
rm -r node_modules
npm install
npm start
```

---

## 🔧 Configuration

### Key Files:
- `.env` - Environment variables
- `contract_abi.json` - Contract interface
- `Certificate.sol` - Smart contract source

### Important Addresses:
- **Contract Address**: `0xC934997aC9Ba105497feE2CBF4217D47c601327D`
- **Blockchain URL**: `http://127.0.0.1:8545`
- **Chain ID**: 1337

---

## 🎯 Testing Flow

1. **Start**: `.\run-all.ps1`
2. **Wait**: 2-3 minutes
3. **Issue**: Go to http://localhost:3000 → Issue Certificate
4. **Copy**: Certificate hash from response
5. **Verify**: Go to Verify Certificate → Paste hash
6. **Expected**: ✅ "Certificate is Valid"

---

## 📚 Documentation

- `COMPLETE_FIX_SUMMARY.md` - Full technical details
- `BEFORE_AND_AFTER.md` - Visual comparison
- `SOLUTION_SUMMARY.md` - Root cause analysis
- `STARTUP_CHECKLIST.md` - Verification checklist

---

## ✨ System Status

✅ **All Systems Operational**
- Contract: Deployed & Callable
- Database: Initialized
- API: Ready
- Frontend: Ready
- Configuration: Correct

**Ready to use!** 🎉
