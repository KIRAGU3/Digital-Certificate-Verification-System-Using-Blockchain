# ✅ System Startup Verification Checklist

## Phase 1: Infrastructure (0-30 seconds)

- [ ] **Ganache Window Opens**
  - Expected output: `Listening on 127.0.0.1:8545`
  - If not: Check port 8545 is free

- [ ] **Ganache Shows Block 0**
  - Should see account addresses with 1000 ETH each
  - If not: Wait another 2-3 seconds

## Phase 2: Smart Contract Deployment (30-60 seconds)

- [ ] **Truffle Migrate Window Opens**
  - Expected: Shows compilation messages
  
- [ ] **Contracts Compile Successfully**
  - Look for: `> Compiling ./contracts/Certificate.sol`
  - Should take ~5 seconds

- [ ] **Migration Succeeds**
  - Look for: `CertificateVerification` deployment address
  - Should be something like: `0xC934...`

- [ ] **Ganache Shows Block > 0**
  - Go back to Ganache window
  - Should now show Block 1, 2, or 3 with transactions

## Phase 3: Django Backend (60-90 seconds)

- [ ] **Django Window Opens**
  - Expected: Command window with Python running

- [ ] **Migrations Run**
  - Look for: `Running migrations...` or `Applying...`
  - Should complete quickly

- [ ] **Server Starts**
  - Look for: `Starting development server at http://127.0.0.1:8000/`
  - If not: Check Django logs in the window

- [ ] **Test Backend is Responsive**
  - Open browser: http://localhost:8000/api/
  - Should see Django REST API documentation
  - ✅ **Backend is working!**

## Phase 4: React Frontend (90-180 seconds)

- [ ] **Frontend Window Opens**
  - Expected: Node.js and npm commands running

- [ ] **Dependencies Install**
  - Look for: `npm install` progress
  - This can take 30-60 seconds

- [ ] **Frontend Compiles**
  - Look for: `Compiled successfully!`
  - May see some warnings - these are OK

- [ ] **Development Server Starts**
  - Look for: `Compiled successfully!` followed by `Listening on...`
  - May see: `On Your Network: http://...`

- [ ] **Test Frontend is Responsive**
  - Open browser: http://localhost:3000
  - Should load the certificate verification application
  - ✅ **Frontend is working!**

## Phase 5: End-to-End Test (All Complete)

- [ ] **All 4 Windows Show Success**
  - Ganache: Running and listening
  - Truffle: Contracts deployed
  - Django: Server running
  - Frontend: Application compiled and running

- [ ] **Certificate Issuance Test**
  1. Go to http://localhost:3000
  2. Navigate to "Issue Certificate"
  3. Fill in test data:
     - Student: "Test Student"
     - Course: "Blockchain 101"
     - Institution: "Test University"
     - Date: Today's date
     - PDF: Any PDF file
  4. Click "Issue Certificate"
  5. ✅ Should succeed and return a certificate hash

- [ ] **Certificate Verification Test**
  1. Copy the certificate hash from issuance response
  2. Navigate to "Verify Certificate"
  3. Paste the hash
  4. Click "Verify Certificate"
  5. ✅ **Should show "Certificate is Valid"** ✅

## 🔴 Common Issues & Quick Fixes

### Issue: "Cannot connect to blockchain"
- **Check**: Is Ganache window still showing `Listening on 127.0.0.1:8545`?
- **Fix**: Look for error in Ganache window, restart if needed

### Issue: "Certificate hash not found"
- **Check**: Did Truffle migration complete successfully?
- **Fix**: Look in Truffle window for deployment address

### Issue: "Frontend won't load"
- **Check**: Is the Frontend window still running?
- **Fix**: Look for compile errors in Frontend window

### Issue: "Port 8000 already in use"
- **Check**: Is there another Django process running?
- **Fix**: `taskkill /PID <PID> /F` for the process using port 8000

### Issue: "Verification returns 'Certificate is Invalid'"
- **Check**: Is this an OLD certificate from before deployment?
- **Fix**: Issue a NEW certificate after the system is fully running

## 📊 Expected Timings

| Component | Start Time | Fully Ready |
|-----------|-----------|------------|
| Ganache | ~2 sec | ~5 sec |
| Truffle | ~5 sec | ~30 sec |
| Django | ~35 sec | ~50 sec |
| Frontend | ~55 sec | ~2 min |
| **ENTIRE SYSTEM** | - | **~2-3 minutes** |

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ http://localhost:3000 loads in browser
2. ✅ Frontend shows "Verify Certificate" and "Issue Certificate" pages
3. ✅ Issue Certificate form accepts input
4. ✅ Successfully issues a certificate and returns a hash
5. ✅ Verify Certificate accepts the hash
6. ✅ **Shows "Certificate is Valid"** ✅
7. ✅ All 4 PowerShell windows still running with no errors

## 🟢 Status: Ready to Start

When you see all checks pass, the system is ready to use!

---

**How to Use This Checklist**:
1. Open this file: `SYSTEM_RESTART_GUIDE.md`
2. Check items off as they complete
3. If stuck on any phase, check the troubleshooting section
4. Once all checks pass, you're good to go! ✅
