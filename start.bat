@echo off
title WebCAD Pro - Browser-Based CAD System
color 0A

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║                                                  ║
echo  ║        ██╗    ██╗██████╗  █████╗ ██████╗         ║
echo  ║        ██║    ██║██╔══██╗██╔══██╗██╔══██╗        ║
echo  ║        ██║ █╗ ██║██████╔╝███████║██████╔╝        ║
echo  ║        ██║███╗██║██╔══██╗██╔══██║██╔══██╗        ║
echo  ║        ╚███╔███╔╝██║  ██║██║  ██║██║  ██║        ║
echo  ║         ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝       ║
echo  ║                                                  ║
echo  ║          WebCAD Pro - CAD Software               ║
echo  ║          Browser-Based 3D Modeling               ║
echo  ║                                                  ║
echo  ╚══════════════════════════════════════════════════╝
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Node.js is not installed!
    echo.
    echo  Please install Node.js from: https://nodejs.org/
    echo  Recommended version: v18 or higher
    echo.
    pause
    exit /b 1
)

:: Display Node.js version
echo  [INFO] Node.js detected:
node --version
echo.

:: Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] npm is not installed!
    echo.
    pause
    exit /b 1
)

echo  [INFO] npm version:
npm --version
echo.

:: Check if node_modules exists
if not exist "node_modules\" (
    echo  [INFO] Dependencies not found. Installing...
    echo.
    echo  ══════════════════════════════════════════════════
    call npm install
    echo  ══════════════════════════════════════════════════
    echo.
    if %ERRORLEVEL% NEQ 0 (
        echo  [ERROR] Failed to install dependencies!
        echo.
        pause
        exit /b 1
    )
    echo  [OK] Dependencies installed successfully!
    echo.
) else (
    echo  [OK] Dependencies already installed.
    echo.
)

:: Ask user what to do
echo  ══════════════════════════════════════════════════
echo.
echo  What would you like to do?
echo.
echo    [1] Start Development Server (npm run dev)
echo    [2] Build Production Version (npm run build)
echo    [3] Build and Preview (npm run build ^&^& npm run preview)
echo    [4] Install Dependencies Only (npm install)
echo    [5] Exit
echo.
echo  ══════════════════════════════════════════════════
echo.
set /p choice="  Enter your choice (1-5): "

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto build
if "%choice%"=="3" goto buildpreview
if "%choice%"=="4" goto install
if "%choice%"=="5" goto exit
echo.
echo  [ERROR] Invalid choice!
pause
exit /b 1

:dev
echo.
echo  ══════════════════════════════════════════════════
echo  Starting Development Server...
echo  ══════════════════════════════════════════════════
echo.
echo  [INFO] The app will open in your browser automatically.
echo  [INFO] Press Ctrl+C to stop the server.
echo.

:: Open browser after a short delay
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

call npm run dev
goto exit

:build
echo.
echo  ══════════════════════════════════════════════════
echo  Building Production Version...
echo  ══════════════════════════════════════════════════
echo.
call npm run build
echo.
if %ERRORLEVEL% EQU 0 (
    echo  [OK] Build completed successfully!
    echo  [INFO] Output folder: dist\
    echo.
    echo  You can deploy the 'dist' folder to any web server.
) else (
    echo  [ERROR] Build failed!
)
echo.
pause
goto exit

:buildpreview
echo.
echo  ══════════════════════════════════════════════════
echo  Building and Previewing...
echo  ══════════════════════════════════════════════════
echo.
call npm run build
if %ERRORLEVEL% EQU 0 (
    echo.
    echo  [INFO] Opening preview in browser...
    start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:4173"
    call npm run preview
) else (
    echo  [ERROR] Build failed!
    pause
)
goto exit

:install
echo.
echo  ══════════════════════════════════════════════════
echo  Installing Dependencies...
echo  ══════════════════════════════════════════════════
echo.
call npm install
echo.
if %ERRORLEVEL% EQU 0 (
    echo  [OK] All dependencies installed successfully!
) else (
    echo  [ERROR] Installation failed!
)
echo.
pause
goto exit

:exit
echo.
echo  Thanks for using WebCAD Pro!
echo.
timeout /t 2 >nul
