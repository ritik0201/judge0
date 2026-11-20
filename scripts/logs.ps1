# Judge0 Logs Viewer (PowerShell)
param (
    [string]$Service = ""
)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..")

if ($Service) {
    docker compose logs -f $Service
} else {
    docker compose logs -f --tail=100
}
