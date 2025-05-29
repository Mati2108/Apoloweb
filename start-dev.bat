@echo off
echo Starting KiFrames Development Server...
echo.

cd backend

echo Installing dependencies...
call npm install

echo.
echo Checking if server files exist...
if not exist "server.js" (
    echo ERROR: server.js not found in backend directory!
    echo Please make sure you're running this from the KiFrames root directory.
    pause
    exit /b 1
)

echo.
echo Starting server on http://localhost:5500
echo Press Ctrl+C to stop the server
echo.
echo Open your browser and go to: http://localhost:5500
echo.

node server.js 