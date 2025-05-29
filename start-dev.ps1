Write-Host "Starting KiFrames Development Server..." -ForegroundColor Green
Write-Host ""

# Navigate to backend directory
Set-Location backend

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Checking if server files exist..." -ForegroundColor Yellow
if (-not (Test-Path "server.js")) {
    Write-Host "ERROR: server.js not found in backend directory!" -ForegroundColor Red
    Write-Host "Please make sure you're running this from the KiFrames root directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting server on http://localhost:5500" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "Open your browser and go to: http://localhost:5500" -ForegroundColor Cyan
Write-Host ""

# Start the server
node server.js 