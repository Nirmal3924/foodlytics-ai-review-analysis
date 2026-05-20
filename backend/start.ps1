# Stop anything already bound to port 8000, then start one API server.
$port = 8000
Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2

Set-Location $PSScriptRoot
Write-Host "Starting Foodlytics API on http://127.0.0.1:$port ..."
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port $port --reload
