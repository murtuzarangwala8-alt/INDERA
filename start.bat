@echo off
echo Starting ChronoLux Watches...
echo.

echo [1/2] Starting Backend Server...
start "ChronoLux Backend" cmd /k "cd server && npm start"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend...
start "ChronoLux Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   ChronoLux Watches is starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo Admin:    http://localhost:5173/admin
echo.
echo Press any key to close this window...
pause > nul
