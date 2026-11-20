# Launch Judge0 Light Studio Frontend
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   Starting Judge0 Light Studio Frontend...      " -ForegroundColor Cyan
Write-Host "   URL: http://127.0.0.1:5174                    " -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan

$FRONTEND_DIR = Join-Path $PSScriptRoot "..\frontend"
Set-Location -Path $FRONTEND_DIR

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

npm run dev
