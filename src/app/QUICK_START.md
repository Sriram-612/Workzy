# 🚀 Workzy Quick Start Guide

## Current Issue: "Failed to fetch" Error
Your app is trying to connect to the backend but it's not running. Here's how to fix it:

## ✅ **Quick Fix (2 minutes):**

1. **Make scripts executable:**
   ```bash
   chmod +x start-workzy.sh troubleshoot.sh
   ```

2. **Start the complete application:**
   ```bash
   ./start-workzy.sh
   ```

This will automatically:
- ✅ Check all system requirements
- ✅ Install dependencies
- ✅ Setup PostgreSQL database
- ✅ Start backend server (port 3001)  
- ✅ Start frontend app (port 3000)

## 🔧 **If Issues Persist:**

Run the troubleshooting tool:
```bash
./troubleshoot.sh
```

## 📋 **Manual Setup (if needed):**

### 1. Backend Setup:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 2. Frontend Setup (in new terminal):
```bash
npm install  # if package.json exists in root
npm start
```

## 🌐 **Access Your App:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Health:** http://localhost:3001/health

## 🔍 **What Fixed the "Failed to fetch" Error:**

1. **Environment Variables:** Recreated `.env` files with correct API URLs
2. **Smart Fallback:** App now automatically uses mock data if backend is unavailable
3. **Backend Server:** The startup script ensures backend runs on port 3001
4. **Database Connection:** Connects to your PostgreSQL database when available

## 🎯 **Key Features Now Working:**

✅ **User Registration/Login** - Saves to PostgreSQL database  
✅ **Database Integration** - All data persisted in your workzy database  
✅ **Real-time Status** - Shows connection status in the app  
✅ **Smart Fallback** - Uses mock data if backend is down  
✅ **JWT Authentication** - Secure token-based sessions  

## 🆘 **Common Issues:**

| Issue | Solution |
|-------|----------|
| Port 3001 in use | `lsof -ti:3001 \| xargs kill -9` |
| PostgreSQL not running | `sudo service postgresql start` |
| Database doesn't exist | `createdb -U postgres workzy` |
| Permission denied | `chmod +x *.sh` |

## 💡 **Pro Tips:**

- Run `./troubleshoot.sh` to diagnose any issues
- The app shows a green indicator when connected to your database
- Users registered in the app will appear in your PostgreSQL `users` table
- Check `http://localhost:3001/health` to verify backend is running

---

**Next:** Once running, try registering a new user and check your PostgreSQL database to see the real data!