<#
run-all.ps1
Opens separate PowerShell windows to start: Ganache, Truffle migrate, Django server, and React frontend.
Edit the .env file at `Django_Backend/.env` to set CONTRACT_ADDRESS before running.
#>

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$contractsDir = Join-Path $repoRoot 'certificate-verification-system'
$djangoDir = Join-Path $repoRoot 'Django_Backend'
$frontendDir = Join-Path $repoRoot 'certificate-verification-frontend'

function Start-NewWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$Location
    )
    Write-Host "Starting $Title in new window (cwd: $Location)"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$Location'; $Command" -WindowStyle Normal
}

# 1) Ganache (npx ganache-cli --deterministic)
Start-NewWindow -Title 'Ganache' -Command "npx ganache-cli --deterministic" -Location $contractsDir

# 2) Truffle migrate (will compile & deploy contracts to Ganache)
Start-NewWindow -Title 'Truffle Migrate' -Command "npx truffle migrate --reset --network development" -Location $contractsDir

# 3) Django server
# If you use a virtualenv named .venv in Django_Backend, this will activate it; otherwise it will run with system Python.
$djangoCommand = "if (Test-Path -Path '.venv\Scripts\Activate.ps1') { . .venv\Scripts\Activate.ps1; }; pip install -r requirements.txt -ErrorAction SilentlyContinue; python manage.py migrate; python manage.py runserver"
Start-NewWindow -Title 'Django' -Command $djangoCommand -Location $djangoDir

# 4) React frontend
Start-NewWindow -Title 'Frontend' -Command "npm install; npm start" -Location $frontendDir

Write-Host "Launched Ganache, Truffle migrate, Django, and Frontend in separate windows.\nCheck each window for output. If you need to stop them, close the windows or use Ctrl+C in each." 
