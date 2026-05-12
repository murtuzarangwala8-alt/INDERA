@echo off
title INDERA - Starting Servers
color 0A

echo.
echo ========================================
echo    INDERA - Premium Jewelry Platform
echo ========================================
echo.
echo Starting Backend Server...
echo.

start "INDERA Backend" cmd /k "cd server && npm start"

timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
echo.

start "INDERA Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   INDERA is starting...
echo ========================================
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000/api
echo   Admin:    http://localhost:5173/admin
echo.
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
