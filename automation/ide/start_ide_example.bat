@echo off
setlocal enabledelayedexpansion

cd /d "%USERPROFILE%\Documents" || exit /b 1

REM Konfigurierbare Pfade - HIER ANPASSEN!
if defined CURSOR_PATH (
    set "CURSOR_PATH=%CURSOR_PATH%"
) else (
    set "CURSOR_PATH=.\Cursor.exe"
)

REM Cursor IDE Konfiguration
set "CURSOR_PORT=9222"

REM Hilfsfunktion: prüft ob Port frei ist
:port_in_use
set "port=%1"
netstat -an | find ":%port% " >nul 2>&1
if %errorlevel% equ 0 (
    exit /b 1
) else (
    exit /b 0
)

REM Hilfsfunktion: zeigt Hilfe
:show_help
echo 🚀 Cursor IDE Starter Script
echo.
echo Verwendung:
echo   %0 [start^|stop^|status^|help]
echo.
echo Befehle:
echo   start   - Cursor IDE auf Port %CURSOR_PORT% starten
echo   stop    - Cursor IDE stoppen
echo   status  - Status prüfen
echo   help    - Diese Hilfe anzeigen
echo.
echo Beispiele:
echo   %0 start        # Cursor starten
echo   %0 status       # Status prüfen
echo   %0 stop         # Cursor stoppen
goto :eof

REM Cursor starten
:start_cursor
REM Prüfe ob Cursor verfügbar ist
if not exist "%CURSOR_PATH%" (
    echo ❌ Cursor nicht gefunden: %CURSOR_PATH%
    echo    Bitte lade Cursor herunter und setze den Pfad in der Konfiguration
    exit /b 1
)

REM Prüfe ob Port bereits belegt ist
call :port_in_use %CURSOR_PORT%
if !errorlevel! equ 1 (
    echo ❌ Port %CURSOR_PORT% ist bereits belegt
    echo    Cursor läuft möglicherweise bereits
    exit /b 1
)

REM Cursor starten
echo 🚀 Starte Cursor IDE auf Port %CURSOR_PORT%...

start "" "%CURSOR_PATH%" --user-data-dir="%USERPROFILE%\.cursor_%CURSOR_PORT%" --remote-debugging-port=%CURSOR_PORT%

echo ✅ Cursor IDE gestartet auf Port %CURSOR_PORT%
echo    Verzeichnis: %USERPROFILE%\.cursor_%CURSOR_PORT%
echo    Debug URL: http://localhost:%CURSOR_PORT%
echo    CDP URL: http://localhost:%CURSOR_PORT%/json/version
goto :eof

REM Cursor stoppen
:stop_cursor
echo 🛑 Stoppe Cursor IDE...

REM Finde Cursor-Prozesse mit CDP-Port
for /f "tokens=5" %%p in ('netstat -ano ^| find ":%CURSOR_PORT% "') do (
    echo    Gefundene Prozesse: %%p
    taskkill /PID %%p /F >nul 2>&1
)

echo ✅ Cursor IDE gestoppt
goto :eof

REM Status prüfen
:check_status
echo 📊 Cursor IDE Status:
echo.

REM Prüfe ob Port belegt ist
call :port_in_use %CURSOR_PORT%
if !errorlevel! equ 1 (
    echo ✅ Port %CURSOR_PORT% ist belegt
    
    REM Zeige Prozesse
    echo 📋 Laufende Prozesse:
    netstat -ano | find ":%CURSOR_PORT% "
) else (
    echo ❌ Port %CURSOR_PORT% ist frei
    echo    Cursor IDE läuft nicht
)

echo.
echo 📁 Cursor Verzeichnis: %USERPROFILE%\.cursor_%CURSOR_PORT%
if exist "%USERPROFILE%\.cursor_%CURSOR_PORT%" (
    echo ✅ Verzeichnis existiert
) else (
    echo ❌ Verzeichnis existiert nicht
)
goto :eof

REM Hauptlogik
set "command=%1"
if "%command%"=="" set "command=start"

if /i "%command%"=="start" goto :start_cursor
if /i "%command%"=="stop" goto :stop_cursor
if /i "%command%"=="status" goto :check_status
if /i "%command%"=="help" goto :show_help

echo ❌ Unbekannter Befehl: %command%
echo.
call :show_help
exit /b 1 