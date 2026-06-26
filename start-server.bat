@echo off
REM Start PSM Test Web Server
REM This script starts the HTTP server on port 8080

cd /d "%~dp0"

echo.
echo ===================================
echo   PSM Test Web Server
echo ===================================
echo.
echo Starting HTTP server on port 8080...
echo.

REM Check if server is already running
netstat -ano | findstr ":8080" >nul
if %errorlevel% equ 0 (
    echo WARNING: Port 8080 is already in use!
    echo Please close the existing server or use a different port.
    echo.
    pause
    exit /b 1
)

REM Start Python HTTP server
echo.
echo Opening http://localhost:8080/index.html in your browser...
echo.
echo To stop the server, run: stop-server.bat
echo.

start http://localhost:8080/index.html

python -m http.server 8080

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start server!
    echo Please ensure Python is installed and in your PATH.
    echo.
    pause
    exit /b 1
)
