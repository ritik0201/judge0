# Judge0 Start Script (PowerShell)
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..")

Write-Host "[Judge0] Starting Judge0 services..." -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "[Judge0] Creating .env from .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
    }
}

# Bring up DB and Redis first
docker compose up -d db redis
Write-Host "[Judge0] Waiting for database and Redis healthchecks..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Bring up server and workers
docker compose up -d

Write-Host "[Judge0] All services started. Container status:" -ForegroundColor Green
docker compose ps
