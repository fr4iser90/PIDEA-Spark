#!/usr/bin/env bash

# Konfigurierbare Pfade - HIER ANPASSEN!
CURSOR_PATH="${CURSOR_PATH:-./Cursor-1.2.2-x86_64.AppImage}"
APPIMAGE_RUNNER="${APPIMAGE_RUNNER:-appimage-run}"

# Cursor IDE Konfiguration
CURSOR_PORT=9222

cd "$HOME/Documents" || exit 1

# Lade Konfiguration (falls vorhanden)
if [[ -f "$(dirname "$0")/ide-config.local.env" ]]; then
    source "$(dirname "$0")/ide-config.local.env"
fi

# Hilfsfunktion: prüft ob Port frei ist
port_in_use() {
  local port=$1
  
  # Prüfe verfügbare Tools in Reihenfolge der Präferenz
  if command -v ss &> /dev/null; then
    ss -tuln | grep -q ":$port "
    return $?
  elif command -v netstat &> /dev/null; then
    netstat -tuln | grep -q ":$port "
    return $?
  elif command -v lsof &> /dev/null; then
    lsof -i ":$port" &>/dev/null
    return $?
  else
    echo "❌ No port check tool available!"
    echo "   Please install one of these tools:"
    echo "   - ss (iproute2): sudo apt install iproute2"
    echo "   - netstat (net-tools): sudo apt install net-tools" 
    echo "   - lsof: sudo apt install lsof"
    echo ""
    echo "   Without port checking, conflicts may occur."
    echo "   Do you want to continue anyway? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
      return 1  # Treat port as "free"
    else
      exit 1
    fi
  fi
}

# Hilfsfunktion: zeigt Hilfe
show_help() {
  echo "🚀 Cursor IDE Starter Script"
  echo ""
  echo "Verwendung:"
  echo "  $0 [start|stop|status|help]"
  echo ""
  echo "Befehle:"
  echo "  start   - Cursor IDE auf Port 9222 starten"
  echo "  stop    - Cursor IDE stoppen"
  echo "  status  - Status prüfen"
  echo "  help    - Diese Hilfe anzeigen"
  echo ""
  echo "Beispiele:"
  echo "  $0 start        # Cursor starten"
  echo "  $0 status       # Status prüfen"
  echo "  $0 stop         # Cursor stoppen"
}

# Cursor starten
start_cursor() {
  # Prüfe ob Cursor verfügbar ist
  if [[ ! -f "$CURSOR_PATH" ]]; then
    echo "❌ Cursor AppImage nicht gefunden: $CURSOR_PATH"
    echo "   Bitte lade Cursor herunter und setze den Pfad in der Konfiguration"
    exit 1
  fi
  
  # Prüfe ob Port bereits belegt ist
  if port_in_use "$CURSOR_PORT"; then
    echo "❌ Port $CURSOR_PORT ist bereits belegt"
    echo "   Cursor läuft möglicherweise bereits"
    exit 1
  fi
  
  # Cursor starten
  echo "🚀 Starte Cursor IDE auf Port $CURSOR_PORT..."
  
  $APPIMAGE_RUNNER "$CURSOR_PATH" \
    --user-data-dir="$HOME/.cursor_$CURSOR_PORT" \
    --remote-debugging-port=$CURSOR_PORT &
  
  echo "✅ Cursor IDE gestartet auf Port $CURSOR_PORT"
  echo "   Verzeichnis: $HOME/.cursor_$CURSOR_PORT"
  echo "   Debug URL: http://localhost:$CURSOR_PORT"
  echo "   CDP URL: http://localhost:$CURSOR_PORT/json/version"
}

# Cursor stoppen
stop_cursor() {
  echo "🛑 Stoppe Cursor IDE..."
  
  # Finde Cursor-Prozesse mit CDP-Port
  local pids=$(lsof -ti:$CURSOR_PORT 2>/dev/null)
  
  if [[ -n "$pids" ]]; then
    echo "   Gefundene Prozesse: $pids"
    kill $pids
    echo "✅ Cursor IDE gestoppt"
  else
    echo "ℹ️  Keine Cursor-Prozesse auf Port $CURSOR_PORT gefunden"
  fi
}

# Status prüfen
check_status() {
  echo "📊 Cursor IDE Status:"
  echo ""
  
  # Prüfe ob Port belegt ist
  if port_in_use "$CURSOR_PORT"; then
    echo "✅ Port $CURSOR_PORT ist belegt"
    
    # Prüfe CDP-Verbindung
    if command -v curl &> /dev/null; then
      echo "🔍 Teste CDP-Verbindung..."
      if curl -s "http://localhost:$CURSOR_PORT/json/version" &>/dev/null; then
        echo "✅ CDP-Verbindung funktioniert"
        echo "   URL: http://localhost:$CURSOR_PORT/json/version"
      else
        echo "❌ CDP-Verbindung fehlgeschlagen"
      fi
    fi
    
    # Zeige Prozesse
    echo "📋 Laufende Prozesse:"
    lsof -i:$CURSOR_PORT 2>/dev/null || echo "   Keine Prozesse gefunden"
  else
    echo "❌ Port $CURSOR_PORT ist frei"
    echo "   Cursor IDE läuft nicht"
  fi
  
  echo ""
  echo "📁 Cursor Verzeichnis: $HOME/.cursor_$CURSOR_PORT"
  if [[ -d "$HOME/.cursor_$CURSOR_PORT" ]]; then
    echo "✅ Verzeichnis existiert"
  else
    echo "❌ Verzeichnis existiert nicht"
  fi
}

# Hauptlogik
case "${1:-start}" in
  "start")
    start_cursor
    ;;
  "stop")
    stop_cursor
    ;;
  "status")
    check_status
    ;;
  "help"|"-h"|"--help")
    show_help
    ;;
  *)
    echo "❌ Unbekannter Befehl: $1"
    echo ""
    show_help
    exit 1
    ;;
esac
