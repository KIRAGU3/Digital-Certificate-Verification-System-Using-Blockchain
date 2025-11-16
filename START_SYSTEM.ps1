# ════════════════════════════════════════════════════════════════════════════
# CERTIFICATE VERIFICATION SYSTEM - STARTUP SCRIPT
# Run this script to start all components (must open multiple terminal windows)
# ════════════════════════════════════════════════════════════════════════════

Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "       Certificate Verification System - Fresh Start Guide         " -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ SYSTEM STARTUP PROCEDURE" -ForegroundColor Green
Write-Host ""

Write-Host "This script will guide you through starting all system components." -ForegroundColor Yellow
Write-Host "You need to open MULTIPLE terminal windows (PowerShell)." -ForegroundColor Yellow
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 1: START GANACHE BLOCKCHAIN" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  OPEN A NEW POWERSHELL WINDOW" -ForegroundColor Yellow
Write-Host ""
Write-Host "Copy and paste this command:" -ForegroundColor White
Write-Host ""
Write-Host "  ganache-cli -p 8545 -d" -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected output:" -ForegroundColor White
Write-Host "  Listening on 127.0.0.1:8545" -ForegroundColor Green
Write-Host ""
Write-Host "Keep this window OPEN - Ganache must stay running!" -ForegroundColor Red
Write-Host ""

$ganacheReady = Read-Host "Is Ganache running on 127.0.0.1:8545? (yes/no)"

if ($ganacheReady -ne "yes") {
    Write-Host "❌ Ganache must be running first!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 2: DEPLOY SMART CONTRACT" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  OPEN ANOTHER NEW POWERSHELL WINDOW" -ForegroundColor Yellow
Write-Host ""
Write-Host "Copy and paste these commands:" -ForegroundColor White
Write-Host ""
Write-Host "  cd C:\certificate-verification-system\certificate-verification-system" -ForegroundColor Cyan
Write-Host "  truffle migrate --reset" -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected output:" -ForegroundColor White
Write-Host "  Compiling your contracts..." -ForegroundColor Green
Write-Host "  Starting migrations..." -ForegroundColor Green
Write-Host "  2_deploy_contracts.js" -ForegroundColor Green
Write-Host "  Deployed to: 0x..." -ForegroundColor Green
Write-Host ""
Write-Host "This window can be closed after deployment completes." -ForegroundColor Yellow
Write-Host ""

$contractReady = Read-Host "Is the contract deployed successfully? (yes/no)"

if ($contractReady -ne "yes") {
    Write-Host "❌ Contract deployment failed!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 3: START DJANGO BACKEND" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  OPEN ANOTHER NEW POWERSHELL WINDOW" -ForegroundColor Yellow
Write-Host ""
Write-Host "Copy and paste these commands:" -ForegroundColor White
Write-Host ""
Write-Host "  cd C:\certificate-verification-system\Django_Backend" -ForegroundColor Cyan
Write-Host "  python manage.py runserver" -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected output:" -ForegroundColor White
Write-Host "  Starting development server at http://127.0.0.1:8000/" -ForegroundColor Green
Write-Host ""
Write-Host "Keep this window OPEN - Django must stay running!" -ForegroundColor Red
Write-Host ""

$djangoReady = Read-Host "Is Django running on 127.0.0.1:8000? (yes/no)"

if ($djangoReady -ne "yes") {
    Write-Host "❌ Django failed to start!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 4: START REACT FRONTEND" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  OPEN ANOTHER NEW POWERSHELL WINDOW" -ForegroundColor Yellow
Write-Host ""
Write-Host "Copy and paste these commands:" -ForegroundColor White
Write-Host ""
Write-Host "  cd C:\certificate-verification-system\certificate-verification-frontend" -ForegroundColor Cyan
Write-Host "  npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected output:" -ForegroundColor White
Write-Host "  Compiled successfully!" -ForegroundColor Green
Write-Host "  Browser opens to http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Keep this window OPEN - React must stay running!" -ForegroundColor Red
Write-Host ""

$reactReady = Read-Host "Is React running on localhost:3000? (yes/no)"

if ($reactReady -ne "yes") {
    Write-Host "❌ React failed to start!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ ALL SYSTEMS READY!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🌐 OPEN IN BROWSER:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://127.0.0.1:8000" -ForegroundColor White
Write-Host ""

Write-Host "📋 NEXT STEPS:" -ForegroundColor Green
Write-Host "  1. Go to http://localhost:3000" -ForegroundColor White
Write-Host "  2. Test certificate issuance (/issue)" -ForegroundColor White
Write-Host "  3. Test certificate verification (/verify)" -ForegroundColor White
Write-Host "  4. Upload or scan QR codes" -ForegroundColor White
Write-Host "  5. Verify certificates show as ✅ VALID" -ForegroundColor White
Write-Host ""

Write-Host "🔍 MONITORING:" -ForegroundColor Green
Write-Host "  • Watch Django terminal for blockchain connection messages" -ForegroundColor White
Write-Host "  • Watch Ganache terminal for transaction details" -ForegroundColor White
Write-Host "  • Check React browser console for any errors" -ForegroundColor White
Write-Host ""

Write-Host "✋ KEEP ALL TERMINAL WINDOWS OPEN!" -ForegroundColor Red
Write-Host "   The system requires all 3 processes running:" -ForegroundColor Red
Write-Host "   • Ganache blockchain" -ForegroundColor Red
Write-Host "   • Django backend" -ForegroundColor Red
Write-Host "   • React frontend" -ForegroundColor Red
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "System is now fully initialized and ready for testing!" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
