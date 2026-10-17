$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Write-Host 'Can cai Node.js LTS tai https://nodejs.org'; Read-Host 'Nhan Enter de dong'; exit }
Write-Host 'May chu tu doc OPENAI_API_KEY tu tep .env trong thu muc nay.'
Write-Host 'Sau khi sua .env, khoi dong lai may chu de ap dung.'
node (Join-Path $PSScriptRoot 'server.mjs')
