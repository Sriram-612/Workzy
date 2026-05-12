#!/bin/bash

echo "🌐 Starting Workzy Frontend..."
echo "============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

echo -e "${BLUE}🔍 Checking requirements...${NC}"

# Check if Node.js is installed
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
fi

# Check if npm is installed
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

# Check if port 3000 is in use
if port_in_use 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use. Attempting to free it...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
    
    if port_in_use 3000; then
        echo -e "${RED}❌ Could not free port 3000. Please kill the process manually:${NC}"
        echo -e "${YELLOW}   lsof -ti:3000 | xargs kill -9${NC}"
        exit 1
    fi
fi

# Check backend connectivity
echo -e "${BLUE}🔍 Checking backend connectivity...${NC}"
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running and accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Backend is not running. Start it with: ./start-backend-only.sh${NC}"
    echo -e "${YELLOW}   Frontend will use mock data fallback.${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Starting frontend development server...${NC}"
echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}Frontend App: http://localhost:3000${NC}"
echo -e "${GREEN}===========================================${NC}"
echo ""

# Start the development server
npm run dev