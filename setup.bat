@echo off
setlocal enabledelayedexpansion

echo.
echo ==============================================
echo Student Management System - Setup
echo ==============================================
echo.

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [X] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% detected
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo [X] Failed to install dependencies
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo Creating .env.local...
    copy .env.example .env.local
    echo [WARNING] Please update .env.local with your secret key
    echo.
)

echo.
echo ==============================================
echo [OK] Setup completed!
echo ==============================================
echo.
echo Next steps:
echo   1. Update .env.local with a secure NEXTAUTH_SECRET
echo   2. Run: npm run dev
echo.
echo Development server will run at:
echo   http://localhost:3000
echo.
echo Demo credentials:
echo   Email: admin@example.com
echo   Password: admin123
echo.

pause
