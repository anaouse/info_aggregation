@echo off
setlocal

echo Stopping Info Aggregation services...

REM ── 后端（端口 1233）──────────────────────────
for /f %%a in (
    'powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 1233 -State Listen -ErrorAction SilentlyContinue).OwningProcess"'
) do (
    echo Stopping backend PID %%a
    taskkill /F /T /PID %%a
)

REM ── 前端 deploy（端口 5989）───────────────────
for /f %%a in (
    'powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue).OwningProcess"'
) do (
    echo Stopping frontend deploy PID %%a
    taskkill /F /T /PID %%a
)

echo Done.
if not "%1"=="/nopause" pause
