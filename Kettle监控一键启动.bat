@echo off
title Kettle Monitor - One Click Start
echo =============================================
echo    Kettle Monitor System - One Click Start
echo =============================================

REM ===== 1. Start Kettle Carte service on 8080 =====
netstat -ano | findstr /c:":8080 " | findstr /c:"LISTENING" >nul 2>&1
if errorlevel 1 goto START_CARTE
echo [1/3] Carte already running, skip.
goto CHECK_WEB

:START_CARTE
echo [1/3] Starting Kettle Carte...
start "Kettle Carte 8080" cmd /k "set PENTAHO_DI_JAVA_OPTIONS=-Xmx1024m && cd /d D:\kettle2012\data-integration && Carte.bat D:\kettle2012\data-integration\pwd\carte-config-master-8080.xml"

:CHECK_WEB
REM ===== 2. Start monitor website on 3000 =====
netstat -ano | findstr /c:":3000 " | findstr /c:"LISTENING" >nul 2>&1
if errorlevel 1 goto START_WEB
echo [2/3] Website already running, skip.
goto WAIT_READY

:START_WEB
echo [2/3] Starting monitor website...
start "Kettle Monitor 3000" cmd /k "cd /d D:\kettle-monitor && node server.js"

:WAIT_READY
REM ===== 3. Wait for services and open browser =====
echo [3/3] Waiting for services, please wait...
set /a COUNT=0
:WAIT_LOOP
ping -n 3 127.0.0.1 >nul
set /a COUNT+=1
netstat -ano | findstr /c:":3000 " | findstr /c:"LISTENING" >nul 2>&1
if not errorlevel 1 goto READY
if %COUNT% GEQ 30 goto TIMEOUT
goto WAIT_LOOP

:READY
echo.
echo =============================================
echo    Services ready! Opening browser...
echo    URL: http://127.0.0.1:3000
echo    This window will close automatically.
echo    To stop services later, close the
echo    "Kettle Carte 8080" and "Kettle Monitor 3000" windows.
echo =============================================
start http://127.0.0.1:3000
ping -n 7 127.0.0.1 >nul
exit

:TIMEOUT
echo.
echo WARNING: timeout, please open http://127.0.0.1:3000 manually.
ping -n 9 127.0.0.1 >nul
exit