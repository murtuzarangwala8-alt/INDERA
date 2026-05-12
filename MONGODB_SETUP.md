# MongoDB Server Setup for INDÉRA

## 🎯 Current Status

Your backend has **TWO modes**:

### 1. **Simple Mode** (Current - No Database)
- File: `server/simple-server.js`
- Stores orders in memory (lost on restart)
- No MongoDB needed
- Good for testing

### 2. **Full Mode** (With MongoDB)
- File: `server/index.js` + `server/app.js`
- Stores orders in MongoDB database
- Persistent data
- User accounts with OAuth
- Production ready

---

## 🚀 Option 1: MongoDB Atlas (Cloud - Recommended)

### Why Atlas?
- ✅ Free tier (512MB storage)
- ✅ No installation needed
- ✅ Works from anywhere
- ✅ Automatic backups
- ✅ Production ready

### Setup Steps (5 minutes):

**Step 1: Create Account**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google or email
3. Verify your email

**Step 2: Create Cluster**
1. Click "Build a Database"
2. Choose **FREE** tier (M0)
3. Select region closest to you (Europe)
4. Cluster name: `indera-cluster`
5. Click "Create"

**Step 3: Create Database User**
1. Click "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Username: `indera_admin`
4. Password: Generate secure password (save it!)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

**Step 4: Allow Network Access**
1. Click "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

**Step 5: Get Connection String**
1. Click "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string:
   ```
   mongodb+srv://indera_admin:<password>@indera-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

**Step 6: Update server/.env**
```env
MONGODB_URI=mongodb+srv://indera_admin:YOUR_PASSWORD@indera-cluster.xxxxx.mongodb.net/indera-jewelry?retryWrites=true&w=majority
```

**Step 7: Switch to Full Mode**

Edit `server/package.json`:
```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

**Step 8: Restart Server**
```bash
cd server
npm start
```

---

## 🖥️ Option 2: Local MongoDB (Windows)

### Why Local?
- ✅ Works offline
- ✅ Faster (no network)
- ✅ Free unlimited storage
- ❌ Requires installation

### Setup Steps (10 minutes):

**Step 1: Download MongoDB**
1. Go to: https://www.mongodb.com/try/download/community
2. Version: 7.0 (current)
3. Platform: Windows
4. Package: MSI
5. Click "Download"

**Step 2: Install MongoDB**
1. Run the downloaded `.msi` file
2. Choose "Complete" installation
3. Check "Install MongoDB as a Service"
4. Check "Install MongoDB Compass" (GUI tool)
5. Click "Next" → "Install"
6. Wait for installation (5 minutes)

**Step 3: Verify Installation**
Open Command Prompt:
```bash
mongod --version
```
Should show: `db version v7.0.x`

**Step 4: Start MongoDB Service**
MongoDB should start automatically. If not:
```bash
net start MongoDB
```

**Step 5: Update server/.env**
```env
MONGODB_URI=mongodb://localhost:27017/indera-jewelry
```

**Step 6: Switch to Full Mode**

Edit `server/package.json`:
```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

**Step 7: Restart Server**
```bash
cd server
npm start
```

---

## 🔄 Switching Between Modes

### To Use Simple Mode (No Database):
```json
// server/package.json
"scripts": {
  "start": "node simple-server.js"
}
```

### To Use Full Mode (With MongoDB):
```json
// server/package.json
"scripts": {
  "start": "node index.js"
}
```

---

## 📊 What's Stored in MongoDB?

### Collections:

**1. users**
- User accounts
- Email, name, phone
- Google OAuth IDs
- Shipping addresses
- Wishlist, cart

**2. orders**
- Customer orders
- Order items
- Payment status
- Shipping info
- Order history

**3. products** (optional)
- Product catalog
- Prices, images
- Categories

---

## ✅ Verify MongoDB Connection

**Step 1: Start Backend**
```bash
cd server
npm start
```

**Step 2: Check Terminal Output**

✅ **Success:**
```
🚀 INDÉRA Backend Server
📍 Server: http://localhost:5000
✅ MongoDB Connected: indera-jewelry
```

❌ **Failed:**
```
❌ MongoDB Connection Error
```

**Step 3: Test API**
Open browser: http://localhost:5000/api/health

Should show:
```json
{
  "success": true,
  "message": "INDÉRA API is running"
}
```

---

## 🐛 Troubleshooting

### "MongoDB Connection Error"

**For Atlas:**
- Check connection string in `server/.env`
- Verify password is correct (no `<` `>` brackets)
- Check Network Access allows your IP
- Check Database User exists

**For Local:**
- Check MongoDB service is running: `net start MongoDB`
- Check port 27017 is not blocked
- Try: `mongodb://127.0.0.1:27017/indera-jewelry`

### "MongoServerError: Authentication failed"
- Wrong username or password
- Recreate database user in Atlas
- Update `server/.env` with new credentials

### "ECONNREFUSED"
- MongoDB service not running
- Start service: `net start MongoDB`
- Or use Atlas instead

---

## 🎯 Recommended Setup

### For Development:
**MongoDB Atlas** (Cloud)
- Easy setup
- No installation
- Works everywhere

### For Production:
**MongoDB Atlas** (Cloud)
- Automatic backups
- Scalable
- Secure
- Professional

---

## 📝 Current Configuration

Your `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/indera-jewelry
```

This expects:
- ✅ Local MongoDB installed
- ✅ MongoDB service running
- ✅ Port 27017 available

---

## 🚀 Quick Start (Recommended)

**Use MongoDB Atlas:**

1. Create free Atlas account (5 min)
2. Get connection string
3. Update `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/indera-jewelry
   ```
4. Restart server: `cd server && npm start`
5. Done! ✅

---

## 💡 Which Should You Use?

| Feature | Simple Mode | Local MongoDB | MongoDB Atlas |
|---------|-------------|---------------|---------------|
| Setup Time | 0 min | 10 min | 5 min |
| Installation | None | Required | None |
| Data Persistence | ❌ | ✅ | ✅ |
| User Accounts | ❌ | ✅ | ✅ |
| Google OAuth | ❌ | ✅ | ✅ |
| Production Ready | ❌ | ⚠️ | ✅ |
| Cost | Free | Free | Free |

**Recommendation:** Use **MongoDB Atlas** for best experience!

---

## 📞 Need Help?

1. Check server terminal for error messages
2. Verify MongoDB is running (Atlas or local)
3. Test connection string
4. Check firewall/antivirus settings

---

**Ready to set up MongoDB?** Choose Atlas (cloud) or Local (Windows) above! 🚀
