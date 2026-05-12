#!/bin/bash

echo "🚀 Workzy Quick Start - Complete Setup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Choose your startup option:${NC}"
echo -e "${YELLOW}1) Start everything (backend + frontend)${NC}"
echo -e "${YELLOW}2) Start backend only${NC}"
echo -e "${YELLOW}3) Start frontend only${NC}"
echo -e "${YELLOW}4) Check system status${NC}"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo -e "${GREEN}🚀 Starting complete Workzy application...${NC}"
        echo ""
        
        # Make scripts executable
        chmod +x start-backend-only.sh start-frontend-only.sh
        
        # Start backend in background
        echo -e "${BLUE}🔧 Starting backend server...${NC}"
        ./start-backend-only.sh &
        BACKEND_PID=$!
        
        # Wait for backend to start
        echo -e "${YELLOW}⏳ Waiting for backend to initialize...${NC}"
        sleep 10
        
        # Check if backend is running
        if curl -s http://localhost:3001/health > /dev/null; then
            echo -e "${GREEN}✅ Backend is ready!${NC}"
        else
            echo -e "${YELLOW}⚠️  Backend may still be starting...${NC}"
        fi
        
        echo ""
        echo -e "${BLUE}🌐 Starting frontend...${NC}"
        ./start-frontend-only.sh
        
        # Cleanup on exit
        trap "kill $BACKEND_PID 2>/dev/null" EXIT
        ;;
    2)
        echo -e "${GREEN}🔧 Starting backend only...${NC}"
        chmod +x start-backend-only.sh
        ./start-backend-only.sh
        ;;
    3)
        echo -e "${GREEN}🌐 Starting frontend only...${NC}"
        chmod +x start-frontend-only.sh
        ./start-frontend-only.sh
        ;;
    4)
        echo -e "${GREEN}🔍 Checking system status...${NC}"
        chmod +x troubleshoot.sh
        ./troubleshoot.sh
        ;;
    *)
        echo -e "${RED}❌ Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac