# Judge0 Restart Script (PowerShell)
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

& (Join-Path $ScriptDir "stop.ps1")
Start-Sleep -Seconds 2
& (Join-Path $ScriptDir "start.ps1")
