@echo off
echo Stopping any existing deploy services...
call "%~dp0stop.bat" /nopause
echo.
set ROOT=%~dp0..
echo Starting Frontend (npm run dev)...
start "Frontend Dev" powershell -NoExit -Command "cd '%ROOT%'; npm run dev"
echo Starting Backend (air)...
start "Backend Dev" powershell -NoExit -Command "cd '%ROOT%\info_aggregation_backend'; air"
echo Both started.
exit
