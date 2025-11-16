# Deployment Checklist - Certificate Verification Fix

## Pre-Deployment

- [ ] Back up database: `db.sqlite3`
- [ ] Note current contract address: `0x...`
- [ ] Document any currently issued certificates
- [ ] Ensure blockchain is running and synced
- [ ] Check all tests pass: `python test_certificate_fix.py`

## Code Changes

- [ ] Updated `Django_Backend/certificates/views.py`
  - [ ] Added `import time`
  - [ ] Modified `IssueCertificateView.post()` to handle `issueDateTimestamp`
  - [ ] Changed timestamp calculation from noon to midnight UTC

- [ ] Updated `Django_Backend/certificates/blockchain.py`
  - [ ] Modified `issue_certificate()` to capture event hash
  - [ ] Modified `verify_certificate_on_chain()` for hash validation

- [ ] Updated `certificate-verification-frontend/src/components/CertificateForm.js`
  - [ ] Changed date parsing to use UTC midnight with `'T00:00:00Z'`
  - [ ] Updated timestamp calculation and sending

## Backend Deployment

- [ ] Stop Django development server
- [ ] Run: `cd Django_Backend`
- [ ] Run: `python manage.py migrate` (should show "No migrations to apply")
- [ ] Run: `python test_certificate_fix.py` 
  - [ ] All tests should pass
  - [ ] Hash generation test passes
  - [ ] Certificate issuance test passes
  - [ ] Certificate verification test passes
- [ ] Start Django server: `python manage.py runserver`
- [ ] Verify backend is responding:
  ```bash
  curl http://localhost:8000/api/certificates/
  ```

## Frontend Deployment

- [ ] In `certificate-verification-frontend/`
- [ ] Run: `npm install` (if needed)
- [ ] Run: `npm run build`
- [ ] Verify build completes without errors
- [ ] If using static file serving, deploy the `build/` folder

## Post-Deployment Validation

### Test 1: Manual Certificate Issuance
- [ ] Open frontend
- [ ] Navigate to "Issue Certificate"
- [ ] Fill in form:
  - [ ] Student Name: "Test Post-Deploy"
  - [ ] Course: "Verification Test"
  - [ ] Institution: "Deployment Test"
  - [ ] Issue Date: Today's date
  - [ ] Certificate PDF: Select any PDF
- [ ] Click "Issue Certificate"
- [ ] Note the returned certificate hash

### Test 2: Certificate Verification
- [ ] Navigate to "Verify Certificate"
- [ ] Paste the certificate hash from Test 1
- [ ] Click "Verify Certificate"
- [ ] **EXPECTED**: ✅ "Certificate is Valid"
- [ ] **FAILURE INDICATES**: Issue not fixed properly
- [ ] Check:
  - [ ] Blockchain connection working
  - [ ] Contract deployment correct
  - [ ] Backend logs show correct timestamp usage

### Test 3: Cross-Timezone Testing (if available)
- [ ] Have user in different timezone issue certificate
- [ ] Verify it passes validation
- [ ] Check backend logs show correct UTC midnight timestamp

### Test 4: Existing Certificates
- [ ] Try to verify any pre-deployment certificates
- [ ] These will likely fail (expected - different timestamp scheme)
- [ ] Document which old certificates are affected
- [ ] Consider re-issuing critical certificates

## Rollback Plan

If something goes wrong:

### Quick Rollback (< 30 minutes to fix)
1. Stop servers
2. Revert code changes:
   ```bash
   git checkout Django_Backend/certificates/views.py
   git checkout Django_Backend/certificates/blockchain.py
   git checkout certificate-verification-frontend/src/components/CertificateForm.js
   ```
3. Rebuild frontend: `npm run build`
4. Restart servers
5. Test with old certificate

### Database Rollback (if needed)
1. Stop servers
2. Restore from backup: `cp db.sqlite3.backup db.sqlite3`
3. Revert code
4. Restart servers

## Documentation

- [ ] Share `QUICK_REFERENCE.md` with team
- [ ] Share `VISUAL_GUIDE.md` with team
- [ ] Share `FIX_DOCUMENTATION.md` with technical team
- [ ] Update team wiki/documentation
- [ ] Document any new certificates issued after deployment

## Monitoring

After deployment, monitor for:
- [ ] Certificate verification success rate (should be ~100% for new certs)
- [ ] Any "Certificate not found" errors in logs
- [ ] Any timestamp mismatch warnings
- [ ] Performance impact (should be minimal)

### Check Logs
```bash
# Django logs
cd Django_Backend
tail -f $(find . -name '*.log' 2>/dev/null | head -1)

# Or with docker
docker logs <container> -f
```

## Success Criteria

✅ **Deployment is successful if:**

1. New certificates can be verified immediately after issuance
2. Verification returns ✅ "Certificate is Valid"
3. No "Certificate not found" errors for new certificates
4. Backend logs show correct timestamp usage
5. Cross-timezone tests pass (if performed)
6. Test script `test_certificate_fix.py` completes successfully
7. No database errors or integrity issues
8. Frontend UI responds without errors

❌ **Deployment has issues if:**

1. Verification still shows "Certificate is Invalid" for new certs
2. "Certificate not found" errors in logs
3. Timezone-related errors in logs
4. Hash format errors
5. Blockchain connection issues

## Support Contact

If deployment fails:
1. Check `QUICK_REFERENCE.md` troubleshooting section
2. Review `FIX_DOCUMENTATION.md` 
3. Run `test_certificate_fix.py` for diagnostics
4. Check blockchain connection with:
   ```bash
   cd Django_Backend
   python manage.py shell
   >>> from certificates.blockchain import web3
   >>> web3.is_connected()  # Should be True
   ```

## Estimated Time

- Backend deployment: 5-10 minutes
- Frontend deployment: 10-15 minutes
- Testing: 15-20 minutes
- **Total: ~30-45 minutes**

## Sign-Off

- [ ] QA Tested: _________________ Date: _______
- [ ] Tech Lead Approved: _________________ Date: _______
- [ ] Deployed by: _________________ Date: _______
- [ ] Verified by: _________________ Date: _______

---

**Last Updated**: November 2024
**Version**: 1.0
**Status**: Ready for Deployment ✅
