@echo off
echo.
echo ========================================
echo  Django System Check & Server Startup
echo ========================================
echo.
cd /d c:\certificate-verification-system\Django_Backend

echo Running system checks...
"C:\Users\HP\AppData\Local\Programs\Python\Python313\python.exe" manage.py check

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ System checks passed!
    echo.
    echo Starting Django development server...
    echo ========================================
    echo.
    "C:\Users\HP\AppData\Local\Programs\Python\Python313\python.exe" manage.py runserver
) else (
    echo.
    echo ❌ System checks failed. Please fix the errors above.
    pause
)
