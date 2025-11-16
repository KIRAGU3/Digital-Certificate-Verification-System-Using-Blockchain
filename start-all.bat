@echo off
REM ════════════════════════════════════════════════════════════════════════════
REM Certificate Verification System - Auto Startup
REM This batch file opens all required terminal windows for the system
REM ════════════════════════════════════════════════════════════════════════════

cls
echo.
echo ════════════════════════════════════════════════════════════════════════
echo    Certificate Verification System - Starting Components
echo ════════════════════════════════════════════════════════════════════════
echo.

REM Get the workspace root directory
set WORKSPACE=C:\certificate-verification-system

echo [1/4] Starting Ganache blockchain on port 8545...
start "Ganache Blockchain" cmd /k "ganache-cli -p 8545 -d"
timeout /t 2 /nobreak

echo [2/4] Starting Django backend on port 8000...
start "Django Backend" cmd /k "cd %WORKSPACE%\Django_Backend && python manage.py runserver"
timeout /t 3 /nobreak

echo [3/4] Starting React frontend on port 3000...
start "React Frontend" cmd /k "cd %WORKSPACE%\certificate-verification-frontend && npm start"
timeout /t 2 /nobreak

echo.
echo ════════════════════════════════════════════════════════════════════════
echo    ✅ All components started!
echo ════════════════════════════════════════════════════════════════════════
echo.
echo    📌 IMPORTANT: You should see 3-4 new terminal windows
echo       - Ganache Blockchain (port 8545)
echo       - Django Backend (port 8000)
echo       - React Frontend (port 3000)
echo.
echo    🌐 Browser will open automatically if React is configured
echo       If not, go to: http://localhost:3000
echo.
echo    ⏳ Give each component 5-10 seconds to fully start
echo.
echo    ✋ DO NOT CLOSE ANY OF THESE WINDOWS!
echo       The system needs all three running simultaneously.
echo.
echo ════════════════════════════════════════════════════════════════════════
echo.
pause

echo ✅ Setup complete! Open http://localhost:3000 in your browser
echo.
pause
