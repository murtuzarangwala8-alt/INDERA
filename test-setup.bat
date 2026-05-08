@echo off
echo ========================================
echo   ChronoLux Watches - Setup Test
echo ========================================
echo.

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Please install Node.js from nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js installed
echo.

echo Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm not found!
    pause
    exit /b 1
)
echo ✓ npm installed
echo.

echo Checking MongoDB...
mongod --version
if %errorlevel% neq 0 (
    echo WARNING: MongoDB not found locally
    echo You can use MongoDB Atlas instead (cloud database)
    echo See SETUP.md for instructions
) else (
    echo ✓ MongoDB installed
)
echo.

echo Checking frontend dependencies...
if not exist "node_modules\" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo ✓ Frontend dependencies installed
)
echo.

echo Checking backend dependencies...
if not exist "server\node_modules\" (
    echo Installing backend dependencies...
    cd server
    call npm install
    cd ..
) else (
    echo ✓ Backend dependencies installed
)
echo.

echo ========================================
echo   Setup Check Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Configure server/.env with your Stripe keys
echo 2. Run start.bat to launch the application
echo.
echo See SETUP.md for detailed instructions
echo.
pause
