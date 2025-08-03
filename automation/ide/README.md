# 🚀 Cursor IDE CDP Starter Scripts

Diese Skripte starten Cursor IDE mit CDP (Chrome DevTools Protocol) auf Port 9222 für die Cursor Automation CDP-Automatisierung.

## 📁 Dateien

- `start_ide_example.sh` - Linux/macOS Bash-Skript
- `start_ide_example.ps1` - Windows PowerShell-Skript  
- `start_ide_example.bat` - Windows Batch-Skript
- `ide-config.env` - Konfigurationsvorlage
- `README.md` - Diese Datei

## 🔧 Konfiguration

### 1. Cursor IDE herunterladen

**Linux:**
```bash
wget https://download.cursor.sh/linux/appImage/x64 -O Cursor-1.2.2-x86_64.AppImage
chmod +x Cursor-1.2.2-x86_64.AppImage
```

**Windows:**
- Lade Cursor von https://cursor.sh herunter
- Installiere oder platziere `Cursor.exe` im Projektverzeichnis

**macOS:**
- Lade Cursor von https://cursor.sh herunter
- Installiere die .dmg-Datei

### 2. Konfigurationsdatei erstellen

```bash
# Kopiere die Vorlage
cp ide-config.env ide-config.local.env

# Bearbeite die Pfade
nano ide-config.local.env
```

**Beispiel `ide-config.local.env`:**
```bash
# Linux/macOS
CURSOR_PATH="./Cursor-1.2.2-x86_64.AppImage"

# Windows
# CURSOR_PATH="C:\Program Files\Cursor\Cursor.exe"

# Cursor IDE Port (fixed)
CURSOR_PORT=9222

# AppImage-Runner (Linux)
APPIMAGE_RUNNER="appimage-run"
```

### 3. Umgebungsvariablen (Alternative)

Du kannst auch Umgebungsvariablen setzen:

```bash
# Linux/macOS
export CURSOR_PATH="./Cursor-1.2.2-x86_64.AppImage"

# Windows PowerShell
$env:CURSOR_PATH = ".\Cursor.exe"

# Windows Batch
set CURSOR_PATH=.\Cursor.exe
```

## 🎮 Verwendung

### Grundlegende Befehle

```bash
# Linux/macOS
./start_ide_example.sh start      # Cursor starten
./start_ide_example.sh stop       # Cursor stoppen
./start_ide_example.sh status     # Status prüfen
./start_ide_example.sh help       # Hilfe anzeigen

# Windows PowerShell
.\start_ide_example.ps1 start
.\start_ide_example.ps1 stop
.\start_ide_example.ps1 status
.\start_ide_example.ps1 help

# Windows Batch
start_ide_example.bat start
start_ide_example.bat stop
start_ide_example.bat status
start_ide_example.bat help
```

### Port-Konfiguration

- **Cursor**: Port 9222 (fest eingestellt)
- **CDP URL**: `http://localhost:9222/json/version`

## 🔍 Troubleshooting

### Cursor nicht gefunden

```bash
# Prüfe ob Cursor existiert
ls -la Cursor-1.2.2-x86_64.AppImage

# Aktualisiere Pfad in Konfiguration
nano ide-config.local.env
```

### Port bereits belegt

```bash
# Prüfe belegte Ports
netstat -tuln | grep :9222

# Stoppe Cursor
./start_ide_example.sh stop

# Starte neu
./start_ide_example.sh start
```

### AppImage-Probleme (Linux)

```bash
# Installiere appimage-run
sudo apt install appimage-run

# Oder setze APPIMAGE_RUNNER="" in der Konfiguration
# für direkte Ausführung
```

### Windows-Probleme

```bash
# Stelle sicher, dass Cursor.exe im richtigen Verzeichnis liegt
dir Cursor.exe

# Prüfe PowerShell-Execution-Policy
Get-ExecutionPolicy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🔗 Integration mit Cursor Automation CDP-Automatisierung

### 1. Cursor starten
```bash
./start_ide_example.sh start
```

### 2. CDP-Verbindung testen
```bash
curl http://localhost:9222/json/version
```

### 3. Automatisierung starten
```bash
./run-automation-cdp.sh -p 9222
```

## 📊 Status-Überwachung

### Status prüfen
```bash
./start_ide_example.sh status
```

**Ausgabe:**
```
📊 Cursor IDE Status:

✅ Port 9222 ist belegt
🔍 Teste CDP-Verbindung...
✅ CDP-Verbindung funktioniert
   URL: http://localhost:9222/json/version
📋 Laufende Prozesse:
   PID 12345 Cursor

📁 Cursor Verzeichnis: /home/user/.cursor_9222
✅ Verzeichnis existiert
```

## 🎯 Beispiele

### Vollständiger Workflow

```bash
# 1. Konfiguration einrichten
cp ide-config.env ide-config.local.env
nano ide-config.local.env

# 2. Cursor starten
./start_ide_example.sh start

# 3. Status prüfen
./start_ide_example.sh status

# 4. Automatisierung starten
./run-automation-cdp.sh -p 9222

# 5. Fortschritt überwachen
./run-automation-cdp.sh --status
```

### Entwicklung und Testing

```bash
# Hauptentwicklung
./start_ide_example.sh start
./run-automation-cdp.sh -p 9222

# Stoppen für Pause
./start_ide_example.sh stop

# Wieder starten
./start_ide_example.sh start
```

## 🔧 Erweiterte Konfiguration

### Mehrere Cursor-Instanzen (manuell)

Falls du mehrere Cursor-Instanzen brauchst, kannst du die Skripte kopieren und den Port ändern:

```bash
# Kopiere Skript
cp start_ide_example.sh start_ide_example_9224.sh

# Ändere Port in der Kopie
sed -i 's/CURSOR_PORT=9222/CURSOR_PORT=9224/' start_ide_example_9224.sh

# Verwende beide
./start_ide_example.sh start      # Port 9222
./start_ide_example_9224.sh start # Port 9224
```

---

**Happy Cursor IDE Automating! 🚀** 