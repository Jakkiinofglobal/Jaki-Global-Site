# Vercel Deployment Guide - Full-Stack App

## Current Situation

Your app is a **full-stack Express + React monolith** that won't deploy properly to Vercel as-is because:

- ✅ Frontend (Vite/React) builds successfully to `dist/`
- ❌ Backend (Express server) cannot run on Vercel without major refactoring
- ❌ Vercel expects either: static sites OR serverless functions

## Solution Options

### Option 1: Split Deployment (RECOMMENDED) 🎯

Deploy frontend and backend separately:

#### **Frontend → Vercel** (Static Site)
**Current `vercel.json` configuration:**
```json
{
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Steps:**
1. Push code to GitHub
2. Connect to Vercel
3. Vercel will build the frontend only
4. ✅ Frontend deployed!

#### **Backend → Render/Railway/Fly.io**

**For Render.com:**
1. Create new "Web Service"
2. Connect GitHub repo
3. Build command: `npm run build`
4. Start command: `npm run start`
5. Environment variables:
   - `NODE_ENV=production`
   - `SESSION_SECRET=your-secret-key`
   - Add any API keys (PRINTIFY_API_KEY, etc.)

**For Railway.app:**
1. Create new project from GitHub
2. Railway auto-detects Express
3. Add environment variables
4. ✅ Backend deployed!

#### **Connect Frontend to Backend:**

Add environment variable in Vercel:
```
VITE_API_URL=https://your-backend.onrender.com
```

Update `client/src/lib/queryClient.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || '';

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = `${API_URL}${url}`;  // Prepend backend URL
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
  // rest of code...
}
```

---

### Option 2: Deploy Full-Stack to Single Platform

**Alternative platforms that handle full-stack apps better:**

#### **Render.com** (Recommended for simplicity)
- Supports full Express + React apps
- Free tier available
- Auto-deploys from GitHub
- Configuration:
  - Build: `npm run build`
  - Start: `npm run start`
  - ✅ One deployment, works perfectly

#### **Railway.app**
- Excellent for Node.js apps
- Simple GitHub integration
- Free $5/month credit
- Auto-detects and deploys

#### **Fly.io**
- Global edge deployment
- Great for full-stack apps
- Free tier available
- Slightly more complex setup

---

### Option 3: Refactor for Vercel Serverless (Advanced)

To make this work on Vercel, you'd need to:
1. Move Express routes to `/api` directory as serverless functions
2. Refactor session management (serverless has no persistent memory)
3. Use Vercel KV or external session store
4. Significant code changes required

**Not recommended** unless you specifically need Vercel's edge network.

---

## Recommended Approach

### For Production: **Render.com (Full-Stack)**

**Why:**
- ✅ Zero code changes needed
- ✅ One deployment handles everything
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ GitHub auto-deploy

**Steps:**
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Create "New Web Service"
4. Select your repository
5. Configure:
   - **Name**: jaki-global-site
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Environment**: Add your secrets
6. Click "Create Web Service"
7. ✅ Live in 2-3 minutes!

---

## Current Vercel Configuration Status

**Your `vercel.json` is NOW configured for frontend-only deployment:**
- Build command: `vite build` (frontend only)
- Output: `dist/` folder
- **This will work** IF you deploy the backend elsewhere

**What happens when you deploy to Vercel now:**
- ✅ Frontend builds successfully
- ✅ Static site serves from `dist/`
- ❌ API calls to `/api/*` will fail (no backend)

---

## Next Steps

### If Using Split Deployment:
1. **Deploy backend to Render/Railway**
2. **Get backend URL** (e.g., `https://your-app.onrender.com`)
3. **Add `VITE_API_URL` to Vercel** environment variables
4. **Update queryClient.ts** to use `VITE_API_URL`
5. **Redeploy frontend to Vercel**
6. ✅ Done!

### If Using Full-Stack Platform:
1. **Choose Render/Railway/Fly.io**
2. **Connect GitHub repository**
3. **Set environment variables**
4. **Deploy**
5. ✅ Done!

---

## FAQ

**Q: Why can't I just deploy everything to Vercel?**
A: Vercel is optimized for serverless/static sites. Your Express server is a traditional long-running process, which doesn't fit Vercel's model without significant refactoring.

**Q: What about the "No Output Directory" error?**
A: Fixed! The current `vercel.json` properly configures `vite build` to output to `dist/`. Vercel will find it now.

**Q: Will my frontend work on Vercel alone?**
A: The frontend will **load**, but all API calls will fail unless you connect it to a backend deployed elsewhere.

**Q: Which platform is easiest?**
A: **Render.com** - literally zero code changes, just connect GitHub and deploy.

**Q: Can I use the free tiers?**
A: Yes! Both Render and Railway have free tiers perfect for testing/small projects.

---

## Summary

**Current Status:**
- ✅ Vercel frontend deployment: **READY**
- ❌ Backend: **Needs separate deployment**

**Best Path Forward:**
Deploy to **Render.com** as a full-stack app (easiest, zero changes)

OR

Deploy frontend to Vercel + backend to Render (more complex, requires API URL config)

Choose based on your needs! 🚀
