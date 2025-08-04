#!/bin/bash

# Specific Task Template Generator Script
# This script generates task-specific templates with intelligent placeholders

echo "🎮 Game Development Specific Task Template Generator"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if the script exists
if [ ! -f "create-specific-templates.js" ]; then
    echo "❌ Error: create-specific-templates.js not found in current directory"
    exit 1
fi

# Make the script executable
chmod +x create-specific-templates.js

# Run the specific template generator
echo "🚀 Running specific template generator..."
node create-specific-templates.js

echo ""
echo "✅ Specific template generation complete!"
echo "📁 Check the task directories for task-specific templates."
echo "🎯 Each task now has intelligent, task-specific placeholders!" 