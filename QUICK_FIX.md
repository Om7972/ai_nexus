# 🔧 Quick Fix for Missing Dependencies

## Issue
Missing packages after transformation: `vite-plugin-pwa`, `swagger-jsdoc`, `swagger-ui-express`, `ioredis`, `cloudinary`

## Solution

### Option 1: Install All Dependencies (Recommended)

Run these commands in order:

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd server
npm install
cd ..
```

### Option 2: Manual Installation

If Option 1 doesn't work, install missing packages manually:

#### Frontend:
```bash
npm install vite-plugin-pwa@0.17.4 workbox-window@7.0.0 lodash@4.17.21 socket.io-client@4.8.3
```

#### Backend:
```bash
cd server
npm install swagger-jsdoc@6.2.8 swagger-ui-express@5.0.0 ioredis@5.3.2 cloudinary@1.41.0 winston-daily-rotate-file@5.0.0
```

## Then Start the Application

```bash
# Terminal 1: Start Backend
cd server
npm run dev

# Terminal 2: Start Frontend (in new terminal)
npm start
```

## Verify Installation

### Check Backend:
```bash
cd server
npm list swagger-jsdoc swagger-ui-express ioredis cloudinary
```

### Check Frontend:
```bash
npm list vite-plugin-pwa lodash socket.io-client
```

## If You Still Have Issues

### Clear Cache and Reinstall:

```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd server
rm -rf node_modules package-lock.json
npm install
```

### Windows Users:
```cmd
REM Frontend
rmdir /s /q node_modules
del package-lock.json
npm install

REM Backend
cd server
rmdir /s /q node_modules
del package-lock.json
npm install
```

## Alternative: Use Yarn

If npm has issues, try using yarn:

```bash
# Install yarn globally
npm install -g yarn

# Frontend
yarn install

# Backend
cd server
yarn install
```

## After Installation

Your app should start without errors:

```bash
# Start backend (Terminal 1)
cd server
npm run dev
# Should see: Server running on port 5000

# Start frontend (Terminal 2)
npm start
# Should see: Local: http://localhost:5173
```

## Expected URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1
- API Docs: http://localhost:5000/api-docs
- Health Check: http://localhost:5000/api/v1/health

## Package Versions Added

### Backend (server/package.json):
- `swagger-jsdoc`: ^6.2.8
- `swagger-ui-express`: ^5.0.0
- `ioredis`: ^5.3.2
- `cloudinary`: ^1.41.0
- `winston-daily-rotate-file`: ^5.0.0

### Frontend (package.json):
- `vite-plugin-pwa`: ^0.17.4
- `workbox-window`: ^7.0.0
- `lodash`: ^4.17.21
- `socket.io-client`: ^4.8.3

## Still Having Issues?

1. Check Node.js version: `node --version` (should be >= 18.0.0)
2. Check npm version: `npm --version` (should be >= 9.0.0)
3. Clear npm cache: `npm cache clean --force`
4. Restart your terminal/IDE
5. Check firewall/antivirus isn't blocking npm

## Need Help?

The package.json files have been updated with all required dependencies.
Just run `npm install` in both root and server directories.

---

✅ After following these steps, your application will start successfully!
