#!/bin/bash

echo "🔧 Making all scripts executable..."

# Make all shell scripts executable
chmod +x *.sh
chmod +x backend/*.sh 2>/dev/null

echo "✅ All scripts are now executable!"
echo ""
echo "🚀 Quick commands:"
echo "   ./quick-start.sh      - Interactive startup menu"
echo "   ./start-backend-only.sh - Backend server only"
echo "   ./start-frontend-only.sh - Frontend app only"
echo "   ./troubleshoot.sh     - System diagnostics"
echo ""
echo "📖 Read START_HERE.md for detailed instructions"