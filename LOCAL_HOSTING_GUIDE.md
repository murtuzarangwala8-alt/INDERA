# 🚀 Host INDÉRA Locally - Complete Guide

## 📋 What You Have

Your INDÉRA website has:
- ✅ Frontend (React + Vite)
- ✅ Backend (Node.js + Express)
- ✅ Google OAuth
- ✅ MongoDB support
- ✅ Payment system

---

## 🎯 Option 1: Run on Your Computer (Development)

### Current Setup:

**Terminal 1 - Backend:**
```bash
cd C:\chronolux-watches\server
npm start
```
Running on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd C:\chronolux-watches
npm run dev
```
Running on: http://localhost:5173

### Access:
- **Website:** http://localhost:5173
- **API:** http://localhost:5000/api
- **Admin:** http://localhost:5173/admin

---

## 🌐 Option 2: Host on Local Network (Access from Phone/Tablet)

### Step 1: Find Your Local IP

**Windows:**
```bash
ipconfig
```
Look for: `IPv4 Address: 192.168.x.x`

### Step 2: Update Backend CORS

Edit `server/app.js`:
```javascript
app.use(cors({
  origin: true,  // Allow all origins on local network
  credentials: true,
}));
```

### Step 3: Update Frontend API URL

Edit `.env`:
```env
VITE_API_URL=http://192.168.x.x:5000/api
```
Replace `192.168.x.x` with your actual IP.

### Step 4: Start Servers with Network Access

**Backend:**
```bash
cd server
set HOST=0.0.0.0
npm start
```

**Frontend:**
```bash
set HOST=0.0.0.0
npm run dev -- --host
```

### Step 5: Access from Other Devices

On your phone/tablet, open:
```
http://192.168.x.x:5173
```

---

## 🖥️ Option 3: Build Production Version (Faster)

### Step 1: Build Frontend

```bash
npm run build
```

This creates optimized files in `dist/` folder.

### Step 2: Preview Production Build

```bash
npm run preview
```

Running on: http://localhost:4173

### Step 3: Serve Production Build

Install serve:
```bash
npm install -g serve
```

Serve the build:
```bash
serve -s dist -l 3000
```

Access: http://localhost:3000

---

## 🔧 Option 4: Single Command Startup

### Create `start-all.bat`:

```batch
@echo off
echo Starting INDÉRA Backend...
start cmd /k "cd server && npm start"

timeout /t 3

echo Starting INDÉRA Frontend...
start cmd /k "npm run dev"

echo.
echo ========================================
echo   INDÉRA is starting...
echo ========================================
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ========================================
```

### Usage:
Double-click `start-all.bat` to start everything!

---

## 🌍 Option 5: Expose to Internet (Temporary)

### Using ngrok (Free):

**Step 1: Install ngrok**
Download: https://ngrok.com/download

**Step 2: Expose Backend**
```bash
ngrok http 5000
```
You'll get: `https://abc123.ngrok.io`

**Step 3: Expose Frontend**
```bash
ngrok http 5173
```
You'll get: `https://xyz789.ngrok.io`

**Step 4: Update Frontend .env**
```env
VITE_API_URL=https://abc123.ngrok.io/api
```

**Step 5: Update Google OAuth**
Add ngrok URLs to Google Cloud Console:
- `https://xyz789.ngrok.io`

**Step 6: Share Link**
Anyone can access: `https://xyz789.ngrok.io`

---

## 📦 Option 6: Windows Service (Always Running)

### Using PM2:

**Step 1: Install PM2**
```bash
npm install -g pm2
```

**Step 2: Start Backend as Service**
```bash
cd server
pm2 start index.js --name indera-backend
```

**Step 3: Start Frontend as Service**
```bash
cd ..
pm2 start "npm run dev" --name indera-frontend
```

**Step 4: Save Configuration**
```bash
pm2 save
pm2 startup
```

**Step 5: Manage Services**
```bash
pm2 list          # View all services
pm2 stop all      # Stop all
pm2 restart all   # Restart all
pm2 logs          # View logs
```

---

## 🎨 Option 7: Custom Domain on Local Network

### Step 1: Edit Hosts File

**Windows:**
```
C:\Windows\System32\drivers\etc\hosts
```

Add:
```
192.168.x.x    indera.local
```

### Step 2: Access via Domain
```
http://indera.local:5173
```

---

## 🔒 Option 8: HTTPS on Localhost

### Using mkcert:

**Step 1: Install mkcert**
Download: https://github.com/FiloSottile/mkcert/releases

**Step 2: Create Certificate**
```bash
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

**Step 3: Configure Vite**

Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    },
  },
});
```

**Step 4: Start with HTTPS**
```bash
npm run dev
```

Access: https://localhost:5173

---

## 📊 Performance Optimization

### For Faster Loading:

**1. Build Production:**
```bash
npm run build
```

**2. Compress Assets:**
```bash
npm install -g gzipper
gzipper compress ./dist
```

**3. Use Production Mode:**
```env
NODE_ENV=production
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Find Process:**
```bash
netstat -ano | findstr :5173
```

**Kill Process:**
```bash
taskkill /PID <process_id> /F
```

### Firewall Blocking

**Allow Node.js:**
1. Windows Defender Firewall
2. Allow an app
3. Add Node.js

### Can't Access from Phone

**Check:**
- Same WiFi network
- Firewall allows connections
- Using correct IP address
- Backend CORS configured

---

## ✅ Recommended Setup

### For Daily Use:
```bash
# Use start-all.bat
Double-click start-all.bat
```

### For Testing on Phone:
```bash
# Use network access
npm run dev -- --host
```

### For Production:
```bash
# Build and serve
npm run build
serve -s dist
```

---

## 📝 Current Status

Your setup:
- ✅ Backend: http://localhost:5000
- ✅ Frontend: http://localhost:5173
- ✅ Google OAuth configured
- ✅ MongoDB ready
- ✅ Production ready

---

## 🚀 Quick Start Commands

**Start Everything:**
```bash
# Terminal 1
cd server && npm start

# Terminal 2
npm run dev
```

**Build Production:**
```bash
npm run build
npm run preview
```

**Network Access:**
```bash
npm run dev -- --host
```

---

**Choose your hosting option above and start using INDÉRA locally!** 🎉
