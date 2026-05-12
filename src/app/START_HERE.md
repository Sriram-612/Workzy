# 🚀 START HERE - Fix "Failed to fetch" Error

## 🎯 **Quick Fix (30 seconds):**

```bash
# Make scripts executable
chmod +x quick-start.sh

# Start everything
./quick-start.sh
```

Choose option **1** to start everything automatically.

---

## 🔧 **What's Happening:**

Your Workzy app is getting "Failed to fetch" errors because:
- ❌ Backend server is not running on port 3001
- ❌ Frontend can't connect to the API
- ✅ App falls back to mock data (that's why it still works)

## ✅ **Solution Steps:**

### **Option A: Automatic (Recommended)**
```bash
./quick-start.sh
# Choose option 1
```

### **Option B: Manual**
```bash
# Terminal 1 - Start Backend
./start-backend-only.sh

# Terminal 2 - Start Frontend  
./start-frontend-only.sh
```

### **Option C: Step by Step**
```bash
# 1. Backend setup
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# 2. Frontend setup (new terminal)
cd ..
npm install  
npm run dev
```

---

## 🌐 **Expected Results:**

After running the startup script:

✅ **Backend:** http://localhost:3001 (API server)  
✅ **Frontend:** http://localhost:3000 (Your app)  
✅ **Database:** Connected to PostgreSQL  
✅ **Status:** Green indicator "Database Connected"  

## 🔍 **Verify It's Working:**

1. **Backend Health:** Visit http://localhost:3001/health
2. **App Status:** Look for green "Database Connected" indicator
3. **Register User:** Create account and check PostgreSQL database
4. **No Console Errors:** Browser console should be clean

---

## ❓ **If Issues Persist:**

```bash
# Run diagnostics
./troubleshoot.sh

# Check what's using the ports
lsof -i :3000  # Frontend port
lsof -i :3001  # Backend port

# Kill processes if needed
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

## 🆘 **Common Issues:**

| Problem | Solution |
|---------|----------|
| "Port already in use" | `lsof -ti:3001 \| xargs kill -9` |
| "Cannot connect to PostgreSQL" | Start PostgreSQL service |
| "Database workzy does not exist" | `createdb -U postgres workzy` |
| "Permission denied" | `chmod +x *.sh` |

---

## 🎉 **Success Indicators:**

- ✅ No "Failed to fetch" errors in console
- ✅ Green "Database Connected" status in app
- ✅ User registration saves to PostgreSQL
- ✅ Both servers running without errors

**Next:** Try registering a new user and check your PostgreSQL database to see real data!

---

*Need help? Run `./troubleshoot.sh` for detailed diagnostics.*