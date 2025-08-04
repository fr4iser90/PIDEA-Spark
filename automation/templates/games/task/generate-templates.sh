#!/bin/bash

# Task Template Generator Script
# This script generates consistent task templates for all game development tasks

echo "🎮 Game Development Task Template Generator"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if the script exists
if [ ! -f "create-task-templates.js" ]; then
    echo "❌ Error: create-task-templates.js not found in current directory"
    exit 1
fi

# Make the script executable
chmod +x create-task-templates.js

# Run the template generator
echo "🚀 Running template generator..."
node create-task-templates.js

echo ""
echo "✅ Template generation complete!"
echo "📁 Check the task directories for generated files." 