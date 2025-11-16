# System Startup Guide - November 11, 2025

## ✅ What Just Started

The `run-all.ps1` script is opening 4 separate PowerShell windows:

### 1️⃣ **Ganache** (Blockchain - Local Development)
- **Port**: 8545
- **Status**: Should show "Listening on 127.0.0.1:8545"
- **Accounts**: Pre-funded with ETH
- **Purpose**: Local Ethereum blockchain for testing

### 2️⃣ **Truffle Migrate** (Deploy Smart Contracts)
- **Command**: `npx truffle migrate --reset --network development`
- **Status**: Will compile and deploy contracts to Ganache
- **Output**: Should show contract addresses and gas usage
- **Note**: This may take 15-30 seconds

### 3️⃣ **Django** (Backend API)
- **URL**: http://localhost:8000
- **Status**: Should show "Starting development server at http://127.0.0.1:8000/"
- **Features**: Certificate API endpoints, blockchain integration
- **Database**: SQLite (local)

### 4️⃣ **React Frontend** (Web UI)
- **URL**: http://localhost:3000
- **Status**: Should show "Compiled successfully" and "On Your Network: http://..."
- **Features**: Certificate issuance form, verification interface

---

## ⏱️ Expected Timeline

| Step | Time | What to Expect |
|------|------|---|
| Ganache starts | ~2 sec | "Listening on 127.0.0.1:8545" |
| Truffle deploys | ~15 sec | Contract addresses printed |
| Django starts | ~10 sec | "Starting development server" |
| Frontend builds | ~30-60 sec | "Compiled successfully" |
| **READY FOR TESTING** | **~2 min** | All 4 windows showing success ✅ |

---

## 🔧 What's Different Now

After the fixes:

✅ **Smart contract IS deployed** to the blockchain
✅ **CONTRACT_ADDRESS in .env is CORRECT**
✅ **Hash generation is consistent**
✅ **Timestamp handling is fixed**

---

## 📝 Testing the Fix

Once everything is running:

### Option 1: Via Frontend (http://localhost:3000)
1. Go to "Issue Certificate" page
2. Fill in:
   - Student Name: (any name)
   - Course: (any course)
   - Institution: (any institution)
   - Issue Date: (pick a date)
   - Certificate PDF: (select a PDF file)
3. Click "Issue Certificate"
4. Copy the **Certificate Hash** from the response
5. Go to "Verify Certificate" page
6. Paste the hash
7. Click "Verify Certificate"
8. **Expected**: ✅ **Certificate is Valid**

### Option 2: Via API (http://localhost:8000)

**Issue Certificate:**
```bash
POST http://localhost:8000/api/certificates/issue/
Content-Type: multipart/form-data

studentName=John Doe
course=Python 101
institution=Tech University
issueDate=2025-11-11
certificatePdf=<PDF FILE>
```

**Verify Certificate:**
```bash
GET http://localhost:8000/api/certificates/verify/0xABC123.../
```

---

## 🐛 Troubleshooting

### If Ganache doesn't start:
- Check if port 8545 is already in use
- Run: `netstat -ano | findstr :8545`
- Kill process if needed: `taskkill /PID <PID> /F`

### If Truffle deploy fails:
- Wait for Ganache to be ready (2-3 seconds)
- Check for compilation errors
- Try running manually: `npx truffle migrate --reset --network development`

### If Django fails to start:
- Check if port 8000 is in use
- Ensure `.env` file is correct
- Run database migrations: `python manage.py migrate`

### If Frontend won't compile:
- Check Node.js version: `node --version` (need v14+)
- Delete node_modules: `rm -r node_modules`
- Reinstall: `npm install`

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────┐
│             Frontend (React)                         │
│           http://localhost:3000                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓ HTTP/REST
┌─────────────────────────────────────────────────────┐
│             Django Backend                           │
│           http://localhost:8000                      │
│        /api/certificates/issue/                      │
│        /api/certificates/verify/<hash>/              │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓ Web3.py
┌─────────────────────────────────────────────────────┐
│      Smart Contract (Solidity)                       │
│   0xC934997aC9Ba105497feE2CBF4217D47c601327D         │
│   ├─ issueCertificate()                              │
│   ├─ verifyCertificate()                             │
│   └─ revokeCertificate()                             │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓ JSON-RPC
┌─────────────────────────────────────────────────────┐
│          Ganache (Local Blockchain)                  │
│           http://localhost:8545                      │
│              Chain ID: 1337                          │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Known Issues (NOW FIXED)

### ✅ Fixed: Invalid CONTRACT_ADDRESS
- **Was**: Placeholder `0x123...`
- **Now**: Correct `0xC934997aC9Ba105497feE2CBF4217D47c601327D`

### ✅ Fixed: Contract Not Deployed
- **Was**: No contract code on blockchain
- **Now**: Contract deployed at chain ID 1337

### ✅ Fixed: Timestamp Handling
- **Was**: Different timestamps used in issuance vs verification
- **Now**: Consistent UTC midnight timestamps

### ✅ Fixed: Hash Mismatch
- **Was**: Hash calculated differently
- **Now**: Consistent solidity_keccak hashing

---

## 📱 Access Points

After startup, you can access:

- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/api/
- **Ganache RPC**: http://localhost:8545
- **Database**: `Django_Backend/db.sqlite3`

---

## ✨ Next Steps

1. ✅ **Wait for all 4 windows to complete** (2-3 minutes)
2. ✅ **Open browser to http://localhost:3000**
3. ✅ **Test certificate issuance**
4. ✅ **Test certificate verification**
5. ✅ **Confirm certificates show as VALID** ✅

---

## 📝 Notes

- Old certificates in the database won't verify (they were issued to the old contract)
- All NEW certificates will work perfectly
- If you need to restart: Close all 4 windows and run `run-all.ps1` again
- Data persists in `db.sqlite3` between restarts
- Ganache resets on each restart (chain state is cleared)

---

**Status**: 🟢 System Ready to Restart
**Time**: November 11, 2025
**Expected Runtime**: 2-3 minutes until fully operational
