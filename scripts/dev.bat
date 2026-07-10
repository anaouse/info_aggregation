@echo off
set ROOT=%~dp0..

echo Stopping any existing deploy services...
call "%~dp0stop.bat" /nopause
echo.

echo Backing up SQLite database...
set DB_PATH=%ROOT%\info_aggregation_backend\data\info_aggregation.sqlite
set BACKUP_DIR=%ROOT%\info_aggregation_backend\data\backup
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set timestamp=%%I
set timestamp=%timestamp:~0,14%
copy /Y "%DB_PATH%" "%BACKUP_DIR%\info_aggregation_%timestamp%.sqlite" >nul
if %errorlevel% equ 0 (
    echo Backup saved: info_aggregation_%timestamp%.sqlite
) else (
    echo WARNING: Database backup failed! DB file may not exist yet.
)
echo.

echo Starting Frontend (npm run dev)...
start "Frontend Dev" powershell -NoExit -Command "cd '%ROOT%'; npm run dev"
echo Starting Backend (air)...
start "Backend Dev" powershell -NoExit -Command "cd '%ROOT%\info_aggregation_backend'; air"
echo Both started.
exit
