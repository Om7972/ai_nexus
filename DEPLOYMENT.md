# AI Nexus – Deploy Backend on Render + Frontend on Netlify

This guide walks through deploying **AI Nexus** with:

- **Backend (Express + MongoDB + Socket.IO)** → [Render](https://render.com)
- **Frontend (React + Vite)** → [Netlify](https://netlify.com)

---

## Prerequisites

Before you start, create accounts and gather:

| Service | Purpose | Required |
|---------|---------|----------|
| [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) | Database | Yes |
| [Render](https://render.com) | Backend hosting | Yes |
| [Netlify](https://netlify.com) | Frontend hosting | Yes |
| [Cloudinary](https://cloudinary.com) | Image uploads | Optional |
| SMTP provider (Gmail, Resend, SendGrid) | Email verification | Optional in dev |

Generate secrets (run locally):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run that **three times** for `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `CSRF_SECRET` / `COOKIE_SECRET`.

---

## Step 1: MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access** → create a database user with password.
3. **Network Access** → add `0.0.0.0/0` (allows Render to connect).
4. **Connect** → copy the connection string, e.g.:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/ai_nexus?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend on Render

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New +** → **Web Service**.
3. Connect your GitHub repo.
4. Configure:

   | Setting | Value |
   |---------|-------|
   | **Name** | `ai-nexus-api` (or your choice) |
   | **Root Directory** | `server` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free or Starter |

5. Add **Environment Variables** (Render dashboard → Environment):

   ```env
   NODE_ENV=production
   PORT=10000
   MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/ai_nexus?retryWrites=true&w=majority

   JWT_SECRET=<64-char-random-hex>
   JWT_REFRESH_SECRET=<different-64-char-random-hex>
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   CLIENT_ORIGIN=https://YOUR-NETLIFY-SITE.netlify.app

   CSRF_SECRET=<32+-char-random-hex>
   COOKIE_SECRET=<32+-char-random-hex>

   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=AI-Nexus <noreply@yourdomain.com>
   ```

   > **Note:** Render sets `PORT` automatically. You can leave `PORT` unset or use `10000`.
   >
   > Update `CLIENT_ORIGIN` after Netlify deploy with your actual Netlify URL.
   > For custom domains: `https://app.yourdomain.com`

6. Click **Create Web Service** and wait for deploy.
7. Verify the API is live:

   ```
   https://YOUR-RENDER-SERVICE.onrender.com/api/v1/health
   ```

   You should see `"success": true`.

### Render notes

- Free tier spins down after inactivity; first request may take ~30s.
- Socket.IO (real-time collaboration) works on Render Web Services.
- Redis is **optional** — caching is disabled unless you set `USE_REDIS=true` and configure Redis separately.

---

## Step 3: Deploy Frontend on Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**.
2. Connect the same GitHub repo.
3. Configure:

   | Setting | Value |
   |---------|-------|
   | **Base directory** | *(leave empty — repo root)* |
   | **Build command** | `npm run build` |
   | **Publish directory** | `dist` |

   Netlify auto-detects settings from `netlify.toml` if present.

4. Add **Environment Variables** (Site settings → Environment variables):

   ```env
   VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api/v1
   VITE_GEMINI_API_KEY=<optional-if-needed>
   ```

5. Deploy the site.
6. Copy your Netlify URL (e.g. `https://ai-nexus-app.netlify.app`).

---

## Step 4: Connect Frontend ↔ Backend

1. In **Render**, update `CLIENT_ORIGIN` to your Netlify URL:

   ```
   CLIENT_ORIGIN=https://YOUR-NETLIFY-SITE.netlify.app
   ```

2. Render will redeploy automatically when env vars change.
3. Open your Netlify site and test login / registration.

---

## Step 5: Custom Domains (Optional)

### Netlify (frontend)

1. Site settings → **Domain management** → Add custom domain.
2. Update DNS as Netlify instructs.

### Render (backend)

1. Service settings → **Custom Domains** → Add domain (e.g. `api.yourdomain.com`).
2. Update frontend env on Netlify:

   ```
   VITE_API_URL=https://api.yourdomain.com/api/v1
   ```

3. Update Render `CLIENT_ORIGIN`:

   ```
   CLIENT_ORIGIN=https://app.yourdomain.com
   ```

---

## Local Development

```bash
# Terminal 1 – Backend
cd server
cp .env.example .env   # fill in MONGO_URI, JWT secrets, etc.
npm install
npm run dev

# Terminal 2 – Frontend (repo root)
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api/v1
npm install
npm start
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:5000/api/v1  
- API docs: http://localhost:5000/api-docs  

---

## Troubleshooting

### CORS errors in browser

- Ensure Render `CLIENT_ORIGIN` exactly matches your Netlify URL (including `https://`, no trailing slash).
- Multiple origins: comma-separate them: `https://site.netlify.app,https://app.yourdomain.com`

### API returns 401 / login fails

- Check `JWT_SECRET` is set on Render (min 32 chars in production).
- Confirm `VITE_API_URL` on Netlify ends with `/api/v1`.

### MongoDB connection failed

- Whitelist `0.0.0.0/0` in Atlas Network Access.
- URL-encode special characters in the password (`@` → `%40`).

### Blank page after Netlify deploy

- `netlify.toml` and `public/_redirects` handle SPA routing — both should exist.
- Check Netlify build logs for failed `npm run build`.

### Socket.IO not connecting

- `VITE_API_URL` must be the Render base URL with `/api/v1` suffix.
- Socket connects to the same host without the `/api/v1` path automatically.

---

## Production Checklist

- [ ] Strong JWT / CSRF / cookie secrets (32+ chars)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] `CLIENT_ORIGIN` set to production frontend URL
- [ ] `VITE_API_URL` set to production backend URL
- [ ] SMTP configured for email verification
- [ ] Health check returns 200: `/api/v1/health`
- [ ] Test register → login → dashboard flow

---

## Project Structure

```
ai_nexus/
├── server/          ← Deploy to Render (root directory: server)
│   ├── server.js
│   ├── app.js
│   └── .env.example
├── src/             ← React frontend
├── netlify.toml     ← Netlify build + SPA redirects
├── .env.example     ← Frontend env template
└── DEPLOYMENT.md    ← This file
```
