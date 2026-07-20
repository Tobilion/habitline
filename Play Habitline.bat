@echo off
title Habitline
cd /d "%~dp0"

echo ==========================================
echo    Habitline
echo ==========================================
echo.

set "PY="
where python >nul 2>nul && set "PY=python"
if not defined PY (
    where py >nul 2>nul && set "PY=py"
)
if not defined PY (
    echo [!] Python is not installed, or not on your PATH.
    echo     Install it from https://python.org and tick
    echo     "Add Python to PATH" during setup.
    echo.
    pause
    exit /b 1
)

echo Starting the local server on port 8002...
echo Your browser will open automatically.
echo.
echo Leave this window open while you use the app.
echo Press Ctrl+C to stop.
echo.

start "" /min cmd /c "timeout /t 2 /nobreak >nul & start "" http://localhost:8002"
%PY% -m http.server 8002

echo.
echo Server stopped.
pause
