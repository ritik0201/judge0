# Judge0 Stop Script (PowerShell)
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..")

Write-Host "[Judge0] Stopping Judge0 services..." -ForegroundColor Yellow
docker compose down
Write-Host "[Judge0] Services stopped successfully." -ForegroundColor Green
