# Judge0 Health Check (PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..")

Write-Host "[Judge0] Running health check on http://127.0.0.1:2358/system_info ..." -ForegroundColor Cyan

try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:2358/system_info" -Method Get -TimeoutSec 5
    Write-Host "[Judge0] API Server is HEALTHY!" -ForegroundColor Green
    $resp | ConvertTo-Json -Depth 3
    exit 0
} catch {
    Write-Host "[Judge0] API Server is UNREACHABLE or UNHEALTHY: $_" -ForegroundColor Red
    exit 1
}
