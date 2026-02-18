@echo off
echo TEATO Setup Script
echo ===================
echo.

echo [1/4] Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ERROR: Server install failed
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Installing client dependencies...
cd client
call npm install
if errorlevel 1 (
    echo ERROR: Client install failed
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Creating uploads directory...
if not exist "server\uploads" mkdir server\uploads

echo.
echo [4/4] Checking environment files...
if not exist "server\.env" (
    echo WARNING: server\.env not found. Copy from server\.env.example
    copy server\.env.example server\.env
    echo Created server\.env - please edit with your MongoDB URI and JWT_SECRET
)
if not exist "client\.env" (
    echo WARNING: client\.env not found. Copy from client\.env.example
    copy client\.env.example client\.env
)

echo.
echo ===================
echo Setup complete!
echo.
echo Next steps:
echo 1. Edit server\.env with your MongoDB URI
echo 2. Run: cd server ^&^& npm run seed
echo 3. Run: cd server ^&^& npm run dev  (Terminal 1)
echo 4. Run: cd client ^&^& npm start     (Terminal 2)
echo.
pause
