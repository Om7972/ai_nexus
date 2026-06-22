@echo off
echo ================================================
echo AI Nexus - Installing Dependencies
echo ================================================
echo.

echo [1/4] Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed
echo.

echo [2/4] Installing backend dependencies...
cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Backend installation failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Backend dependencies installed
echo.

echo [3/4] Verifying installations...
echo Checking backend packages...
cd server
call npm list swagger-jsdoc swagger-ui-express ioredis cloudinary 2>nul
cd ..
echo.

echo [4/4] Setup complete!
echo.
echo ================================================
echo Installation Complete! 
echo ================================================
echo.
echo Next steps:
echo 1. Configure .env files (see .env.example)
echo 2. Start backend:  cd server ^&^& npm run dev
echo 3. Start frontend: npm start
echo.
echo URLs:
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:5000/api/v1
echo - API Docs: http://localhost:5000/api-docs
echo.
pause
