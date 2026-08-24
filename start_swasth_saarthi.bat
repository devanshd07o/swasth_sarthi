@echo off
title SwasthSaarthi Launcher
color 0A
echo.
echo  =============================================================
echo     ?? SWASTH SAARTHI - AYUSH EHR DIGITAL HEALTH PLATFORM
echo  =============================================================
echo.
echo  [1/3] Starting FastAPI Backend Server (Port 8000)...
start "SwasthSaarthi Backend" /min cmd /c "cd /d d:\LetsCode\SwasthSaarthi\backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo  [2/3] Starting Vite Frontend Server (Port 3000)...
start "SwasthSaarthi Frontend" /min cmd /c "cd /d d:\LetsCode\SwasthSaarthi\frontend && npm run dev"

echo  [3/3] Opening SwasthSaarthi in Browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo  =============================================================
echo   ? SwasthSaarthi is running!
echo   ? Frontend:  http://localhost:3000
echo   ? Backend:   http://localhost:8000/docs
echo  =============================================================
echo.
