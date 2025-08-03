# Cursor IDE Starter Script für Windows PowerShell
param(
    [string]$Command = "start"
)

# Konfigurierbare Pfade - HIER ANPASSEN!
$CURSOR_PATH = if ($env:CURSOR_PATH) { $env:CURSOR_PATH } else { ".\Cursor.exe" }

# Cursor IDE Konfiguration
$CURSOR_PORT = 9222

# Hilfsfunktion: prüft ob Port frei ist
function Test-PortInUse {
    param([int]$Port)
    
    try {
        $connection = Test-NetConnection -ComputerName "localhost" -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection.TcpTestSucceeded
    }
    catch {
        return $false
    }
}

# Hilfsfunktion: zeigt Hilfe
function Show-Help {
    Write-Host "🚀 Cursor IDE Starter Script" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verwendung:" -ForegroundColor White
    Write-Host "  .\start_ide_example.ps1 [start|stop|status|help]" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Befehle:" -ForegroundColor White
    Write-Host "  start   - Cursor IDE auf Port $CURSOR_PORT starten" -ForegroundColor Gray
    Write-Host "  stop    - Cursor IDE stoppen" -ForegroundColor Gray
    Write-Host "  status  - Status prüfen" -ForegroundColor Gray
    Write-Host "  help    - Diese Hilfe anzeigen" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Beispiele:" -ForegroundColor White
    Write-Host "  .\start_ide_example.ps1 start        # Cursor starten" -ForegroundColor Gray
    Write-Host "  .\start_ide_example.ps1 status       # Status prüfen" -ForegroundColor Gray
    Write-Host "  .\start_ide_example.ps1 stop         # Cursor stoppen" -ForegroundColor Gray
}

# Cursor starten
function Start-Cursor {
    # Prüfe ob Cursor verfügbar ist
    if (-not (Test-Path $CURSOR_PATH)) {
        Write-Host "❌ Cursor nicht gefunden: $CURSOR_PATH" -ForegroundColor Red
        Write-Host "   Bitte lade Cursor herunter und setze den Pfad in der Konfiguration" -ForegroundColor Yellow
        exit 1
    }
    
    # Prüfe ob Port bereits belegt ist
    if (Test-PortInUse -Port $CURSOR_PORT) {
        Write-Host "❌ Port $CURSOR_PORT ist bereits belegt" -ForegroundColor Red
        Write-Host "   Cursor läuft möglicherweise bereits" -ForegroundColor Yellow
        exit 1
    }
    
    # Cursor starten
    Write-Host "🚀 Starte Cursor IDE auf Port $CURSOR_PORT..." -ForegroundColor Green
    
    try {
        Start-Process -FilePath $CURSOR_PATH -ArgumentList "--user-data-dir=`"$env:USERPROFILE\.cursor_$CURSOR_PORT`"", "--remote-debugging-port=$CURSOR_PORT" -WindowStyle Normal
        
        Write-Host "✅ Cursor IDE gestartet auf Port $CURSOR_PORT" -ForegroundColor Green
        Write-Host "   Verzeichnis: $env:USERPROFILE\.cursor_$CURSOR_PORT" -ForegroundColor Gray
        Write-Host "   Debug URL: http://localhost:$CURSOR_PORT" -ForegroundColor Gray
        Write-Host "   CDP URL: http://localhost:$CURSOR_PORT/json/version" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ Fehler beim Starten von Cursor: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Cursor stoppen
function Stop-Cursor {
    Write-Host "🛑 Stoppe Cursor IDE..." -ForegroundColor Yellow
    
    # Finde Cursor-Prozesse mit CDP-Port
    $processes = Get-NetTCPConnection -LocalPort $CURSOR_PORT -ErrorAction SilentlyContinue | ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue } | Where-Object { $_.ProcessName -like "*cursor*" -or $_.ProcessName -like "*Cursor*" }
    
    if ($processes) {
        Write-Host "   Gefundene Prozesse: $($processes.Id -join ', ')" -ForegroundColor Gray
        $processes | Stop-Process -Force
        Write-Host "✅ Cursor IDE gestoppt" -ForegroundColor Green
    }
    else {
        Write-Host "ℹ️  Keine Cursor-Prozesse auf Port $CURSOR_PORT gefunden" -ForegroundColor Yellow
    }
}

# Status prüfen
function Get-CursorStatus {
    Write-Host "📊 Cursor IDE Status:" -ForegroundColor Cyan
    Write-Host ""
    
    # Prüfe ob Port belegt ist
    if (Test-PortInUse -Port $CURSOR_PORT) {
        Write-Host "✅ Port $CURSOR_PORT ist belegt" -ForegroundColor Green
        
        # Prüfe CDP-Verbindung
        try {
            Write-Host "🔍 Teste CDP-Verbindung..." -ForegroundColor Gray
            $response = Invoke-WebRequest -Uri "http://localhost:$CURSOR_PORT/json/version" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ CDP-Verbindung funktioniert" -ForegroundColor Green
                Write-Host "   URL: http://localhost:$CURSOR_PORT/json/version" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "❌ CDP-Verbindung fehlgeschlagen" -ForegroundColor Red
        }
        
        # Zeige Prozesse
        Write-Host "📋 Laufende Prozesse:" -ForegroundColor Gray
        $processes = Get-NetTCPConnection -LocalPort $CURSOR_PORT -ErrorAction SilentlyContinue | ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue }
        if ($processes) {
            $processes | Format-Table Id, ProcessName, Path -AutoSize
        }
        else {
            Write-Host "   Keine Prozesse gefunden" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "❌ Port $CURSOR_PORT ist frei" -ForegroundColor Red
        Write-Host "   Cursor IDE läuft nicht" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "📁 Cursor Verzeichnis: $env:USERPROFILE\.cursor_$CURSOR_PORT" -ForegroundColor Gray
    if (Test-Path "$env:USERPROFILE\.cursor_$CURSOR_PORT") {
        Write-Host "✅ Verzeichnis existiert" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Verzeichnis existiert nicht" -ForegroundColor Red
    }
}

# Hauptlogik
switch ($Command.ToLower()) {
    "start" {
        Start-Cursor
    }
    "stop" {
        Stop-Cursor
    }
    "status" {
        Get-CursorStatus
    }
    "help" {
        Show-Help
    }
    default {
        Write-Host "❌ Unbekannter Befehl: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
        exit 1
    }
} 