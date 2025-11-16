@echo off
echo Running Django migrations...
cd /d c:\certificate-verification-system\Django_Backend
"C:\Users\HP\AppData\Local\Programs\Python\Python313\python.exe" manage.py migrate
echo.
echo Migrations completed!
echo.
echo To start the server, run:
echo "C:\Users\HP\AppData\Local\Programs\Python\Python313\python.exe" manage.py runserver
pause
