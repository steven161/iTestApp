@echo off
REM Stop PSM Test Web Server
REM This script stops the HTTP server running on port 8080

echo.
echo ===================================
echo   Stopping PSM Test Web Server
echo ===================================
echo.

REM Check if server is running
netstat -ano | findstr ":8080" >nul
if %errorlevel% neq 0 (
    echo No server found running on port 8080
    echo.
    pause
    exit /b 0
)

echo Finding and stopping server on port 8080...

REM Get the PID of the process using port 8080
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do (
    taskkill /PID %%a /F >nul 2>&1
    if %errorlevel% equ 0 (
        echo Successfully stopped server (PID: %%a)
    ) else (
        echo Failed to stop server
        pause
        exit /b 1
    )
)

echo.
echo Server stopped successfully!
echo.
pause
