#!/bin/bash

# VibeFighters CDP Task Automation Runner
# 
# This script provides an easy way to run the CDP-based automated task execution workflow
# that connects directly to Cursor IDE or ChatGPT via Chrome DevTools Protocol.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTOMATION_SCRIPT="$SCRIPT_DIR/automation-workflow-cdp.js"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "VibeFighters CDP Task Automation Runner"
    echo ""
    echo "This script automates tasks by controlling Cursor IDE or ChatGPT via CDP"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -p, --port=N            CDP port (default: 9223)"
    echo "  -t, --target=TARGET     Target: 'cursor' or 'chatgpt' (default: cursor)"
    echo "  --task-id=N             Start from specific task ID"
    echo "  -d, --dry-run           Show what would be executed without running"
    echo "  -v, --verbose           Enable verbose output"
    echo "  --list-tasks            List all available tasks"
    echo "  --status                Show current project status"
    echo "  --setup-chrome          Help setup Chrome with CDP"
    echo ""
    echo "Examples:"
    echo "  $0                      # Run with Cursor on port 9223"
    echo "  $0 -p 9224              # Use different CDP port"
    echo "  $0 -t chatgpt           # Use ChatGPT instead of Cursor"
    echo "  $0 --task-id=5          # Start from task 5"
    echo "  $0 --setup-chrome       # Get Chrome setup instructions"
    echo ""
    echo "Prerequisites:"
    echo "  1. Chrome running with --remote-debugging-port=9223"
    echo "  2. Cursor IDE or ChatGPT open in Chrome"
    echo "  3. Node.js and Playwright installed"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if automation script exists
    if [ ! -f "$AUTOMATION_SCRIPT" ]; then
        print_error "Automation script not found: $AUTOMATION_SCRIPT"
        exit 1
    fi
    
    # Check if orchestrator file exists
    if [ ! -f "docs/09_roadmap/tasks/system/orchestrator.md" ]; then
        print_error "Orchestrator file not found. Are you in the correct directory?"
        exit 1
    fi
    
    # Check if Playwright is installed
    if ! node -e "require('playwright')" 2>/dev/null; then
        print_warning "Playwright not installed. Installing..."
        npm install playwright
    fi
    
    print_success "Prerequisites check passed"
}

# Function to setup Chrome instructions
setup_chrome() {
    echo "🔧 Chrome CDP Setup Instructions"
    echo ""
    echo "1. Close all Chrome instances"
    echo ""
    echo "2. Start Chrome with CDP enabled:"
    echo "   Linux:"
    echo "     google-chrome --remote-debugging-port=9223 --user-data-dir=/tmp/chrome-debug"
    echo "   macOS:"
    echo "     /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9223 --user-data-dir=/tmp/chrome-debug"
    echo "   Windows:"
    echo "     \"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\" --remote-debugging-port=9223 --user-data-dir=C:\\temp\\chrome-debug"
    echo ""
    echo "3. Open Cursor IDE in the new Chrome window"
    echo "   - Navigate to your Cursor IDE instance"
    echo "   - Make sure the chat interface is visible"
    echo ""
    echo "4. Verify CDP is working:"
    echo "   curl http://localhost:9223/json/version"
    echo ""
    echo "5. Run the automation:"
    echo "   $0"
    echo ""
    echo "Troubleshooting:"
    echo "  - If connection fails, try a different port: $0 --port=9224"
    echo "  - Make sure no other Chrome instance is using the same port"
    echo "  - Check if Cursor is accessible in the browser"
}

# Function to check CDP connection
check_cdp_connection() {
    local port=$1
    
    print_status "Checking CDP connection on port $port..."
    
    # Try to connect to CDP
    if curl -s "http://localhost:$port/json/version" > /dev/null 2>&1; then
        print_success "CDP connection successful on port $port"
        
        # Get browser info
        local browser_info=$(curl -s "http://localhost:$port/json/version" 2>/dev/null)
        if [ -n "$browser_info" ]; then
            local browser_name=$(echo "$browser_info" | grep -o '"Browser": "[^"]*"' | cut -d'"' -f4)
            local protocol_version=$(echo "$browser_info" | grep -o '"Protocol-Version": "[^"]*"' | cut -d'"' -f4)
            print_status "Browser: $browser_name, Protocol: $protocol_version"
        fi
        
        return 0
    else
        print_error "CDP connection failed on port $port"
        print_warning "Make sure Chrome is running with --remote-debugging-port=$port"
        print_warning "Try running: google-chrome --remote-debugging-port=$port --user-data-dir=/tmp/chrome-debug"
        return 1
    fi
}

# Function to list tasks
list_tasks() {
    print_status "Available tasks:"
    echo ""
    
    if [ -f "docs/09_roadmap/tasks/system/orchestrator.md" ]; then
        # Extract task table from orchestrator
        grep -E "^\| [0-9]+ \|" docs/09_roadmap/tasks/system/orchestrator.md | while read line; do
            # Parse task information
            task_id=$(echo "$line" | awk -F'|' '{print $2}' | xargs)
            task_name=$(echo "$line" | awk -F'|' '{print $3}' | xargs)
            task_status=$(echo "$line" | awk -F'|' '{print $5}' | xargs)
            task_progress=$(echo "$line" | awk -F'|' '{print $6}' | xargs)
            
            # Color code status
            if [[ "$task_status" == *"Completed"* ]]; then
                status_color=$GREEN
            elif [[ "$task_status" == *"In Progress"* ]]; then
                status_color=$YELLOW
            else
                status_color=$NC
            fi
            
            printf "  %2s. %-40s %s%s%s (%s)\n" "$task_id" "$task_name" "$status_color" "$task_status" "$NC" "$task_progress"
        done
    else
        print_error "Orchestrator file not found"
        exit 1
    fi
}

# Function to show status
show_status() {
    print_status "Current project status:"
    echo ""
    
    if [ -f "docs/09_roadmap/tasks/system/progress-tracker.md" ]; then
        cat docs/09_roadmap/tasks/system/progress-tracker.md
    else
        print_warning "Progress tracker not found. Run automation first to generate status."
    fi
}

# Parse command line arguments
CDP_PORT=9223
TARGET="cursor"
TASK_ID=""
DRY_RUN=false
VERBOSE=false
LIST_TASKS=false
SHOW_STATUS=false
SETUP_CHROME=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -p|--port)
            CDP_PORT="$2"
            shift 2
            ;;
        --port=*)
            CDP_PORT="${1#*=}"
            shift
            ;;
        -t|--target)
            TARGET="$2"
            shift 2
            ;;
        --target=*)
            TARGET="${1#*=}"
            shift
            ;;
        --task-id)
            TASK_ID="$2"
            shift 2
            ;;
        --task-id=*)
            TASK_ID="${1#*=}"
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --list-tasks)
            LIST_TASKS=true
            shift
            ;;
        --status)
            SHOW_STATUS=true
            shift
            ;;
        --setup-chrome)
            SETUP_CHROME=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_status "VibeFighters CDP Task Automation Runner"
    echo ""
    
    # Handle special commands
    if [ "$SETUP_CHROME" = true ]; then
        setup_chrome
        exit 0
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Handle special commands
    if [ "$LIST_TASKS" = true ]; then
        list_tasks
        exit 0
    fi
    
    if [ "$SHOW_STATUS" = true ]; then
        show_status
        exit 0
    fi
    
    # Check CDP connection
    if ! check_cdp_connection "$CDP_PORT"; then
        print_error "Cannot connect to Chrome CDP on port $CDP_PORT"
        echo ""
        print_warning "Run '$0 --setup-chrome' for setup instructions"
        exit 1
    fi
    
    # Build command
    CMD="node $AUTOMATION_SCRIPT"
    
    if [ -n "$CDP_PORT" ]; then
        CMD="$CMD --port=$CDP_PORT"
    fi
    
    if [ -n "$TARGET" ]; then
        CMD="$CMD --target=$TARGET"
    fi
    
    if [ -n "$TASK_ID" ]; then
        CMD="$CMD --task-id=$TASK_ID"
    fi
    
    if [ "$VERBOSE" = true ]; then
        CMD="$CMD --verbose"
    fi
    
    # Show what will be executed
    print_status "Command to execute:"
    echo "  $CMD"
    echo ""
    print_status "Target: $TARGET on CDP port $CDP_PORT"
    echo ""
    
    if [ "$DRY_RUN" = true ]; then
        print_warning "Dry run mode - not executing actual command"
        exit 0
    fi
    
    # SAFETY CHECK - Ask for confirmation
    print_warning "⚠️  WARNING: This script will control Cursor IDE automatically!"
    print_warning "⚠️  Make sure you have saved all your work!"
    print_warning "⚠️  The script will send automated prompts to Cursor AI"
    echo ""
    print_warning "Are you sure you want to continue? (y/N)"
    read -r safety_confirm
    
    if [[ ! "$safety_confirm" =~ ^[Yy]$ ]]; then
        print_status "Automation cancelled by user"
        exit 0
    fi
    
    # Additional safety check
    print_warning "Final warning: This will automate Cursor IDE. Continue? (yes/NO)"
    read -r final_confirm
    
    if [[ ! "$final_confirm" =~ ^[Yy][Ee][Ss]$ ]]; then
        print_status "Automation cancelled by user"
        exit 0
    fi
    
    # Confirm target
    if [ "$TARGET" = "cursor" ]; then
        print_warning "Make sure Cursor IDE is open in Chrome on the CDP port"
    elif [ "$TARGET" = "chatgpt" ]; then
        print_warning "Make sure ChatGPT is open in Chrome on the CDP port"
    fi
    
    print_status "Press Enter to continue or Ctrl+C to cancel..."
    read -r
    
    # Execute automation
    print_status "Starting CDP automation workflow..."
    echo ""
    
    # Run the automation with safety measures
    print_status "Starting automation with safety measures..."
    eval "$CMD"
    
    # Check exit status
    if [ $? -eq 0 ]; then
        print_success "CDP automation workflow completed successfully!"
    else
        print_error "CDP automation workflow failed!"
        exit 1
    fi
}

# Run main function
main "$@" 