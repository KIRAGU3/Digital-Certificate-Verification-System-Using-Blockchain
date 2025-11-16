# Run Django Migrations
$pythonPath = "C:/Users/HP/AppData/Local/Programs/Python/Python313/python.exe"

Write-Host "🔄 Running Django migrations..." -ForegroundColor Cyan

& $pythonPath manage.py migrate

Write-Host "✅ Migrations completed!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start the Django server, run:" -ForegroundColor Green
Write-Host "  & `"$pythonPath`" manage.py runserver" -ForegroundColor Yellow
