@echo off
echo Stopping any existing deploy services...
call "%~dp0stop.bat" /nopause
echo.
set ROOT=%~dp0..
echo Starting Frontend (npm run dev)...
start "Frontend Dev" cmd /k "cd /d %ROOT% && npm run dev"
echo Starting Backend (air)...
start "Backend Dev" cmd /k "cd /d %ROOT%\info_aggregation_backend && air"
echo Both started.
exit
