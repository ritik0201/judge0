# Judge0 Status Checker (PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..")

Write-Host "[Judge0] Service Container Status:" -ForegroundColor Cyan
docker compose ps
