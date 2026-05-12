# 🚀 Quick Start - Host INDÉRA Locally

## ⚡ Fastest Way (One Click)

**Double-click:** `start-indera.bat`

This will:
- ✅ Start backend server (port 5000)
- ✅ Start frontend server (port 5173)
- ✅ Open in 2 separate windows

---

## 🌐 Access Your Website

**On Your Computer:**
- Website: http://localhost:5173
- Admin: http://localhost:5173/admin
- API: http://localhost:5000/api

**On Your Phone/Tablet (Same WiFi):**
1. Find your IP: Run `ipconfig` in Command Prompt
2. Look for: `IPv4 Address: 192.168.x.x`
3. Open on phone: `http://192.168.x.x:5173`

---

## 📱 Enable Phone Access

Your Vite config is already set up for network access!

**Just start the servers:**
```bash
# Backend
cd server
npm start

# Frontend (new terminal)
npm run dev
```

**Then check terminal output for:**
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

Use the Network URL on your phone!

---

## 🛠️ Manual Start (If Needed)

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## 🎯 What's Running

- **Frontend:** React + Vite (Port 5173)
- **Backend:** Node.js + Express (Port 5000)
- **Database:** MongoDB (Port 27017 or Atlas)
- **OAuth:** Google Sign-In enabled

---

## ✅ Features Available

- ✅ Browse jewelry collections
- ✅ Add to cart & wishlist
- ✅ Google OAuth login
- ✅ User accounts
- ✅ Checkout & payments
- ✅ Admin dashboard
- ✅ Order management

---

## 🔧 Troubleshooting

**Port already in use:**
```bash
# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <process_id> /F
```

**Can't access from phone:**
- Check same WiFi network
- Check firewall settings
- Use Network URL from terminal

**Backend not connecting:**
- Check MongoDB is running (or using Atlas)
- Check `server/.env` configuration
- Restart backend server

---

## 📚 More Options

See `LOCAL_HOSTING_GUIDE.md` for:
- Production builds
- HTTPS setup
- Custom domains
- Windows services
- Internet exposure (ngrok)

---

**Ready?** Double-click `start-indera.bat` and go to http://localhost:5173! 🎉
