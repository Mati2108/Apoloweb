@echo off
echo ========================================
echo    Starting KiFrames Backend Server
echo ========================================
echo.

cd backend

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo.
echo Starting server on port 3001...
echo Frontend will be available at: http://localhost:3001
echo API endpoints available at: http://localhost:3001/api/
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause 