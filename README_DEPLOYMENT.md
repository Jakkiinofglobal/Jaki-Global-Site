# Jaki Global - Split Deployment Guide

## 🎯 Deployment Architecture

**Backend**: Render → https://jaki-global-site.onrender.com  
**Frontend**: Vercel → https://jaki-global-site.vercel.app

---

## ✅ Fixed: Tailwind CSS Issue (Oct 31, 2025)

**Problem**: Vercel deployment showed unstyled content  
**Solution**: Fixed `client/tailwind.config.ts` content paths

The paths are now correctly relative to `/client`:
```typescript
content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"]
```

**Verification**: CSS build size increased from ~76 KB to **137.85 KB** ✅

---

## 🚀 Quick Deploy

```bash
git add -A
git commit -m "Fix: Tailwind CSS content paths for Vercel"
git push origin main
```

Vercel will auto-deploy from the `/client` folder with full styling.

---

## 📁 Project Structure

```
/
├── client/              # Frontend → Vercel
│   ├── src/
│   ├── dist/           # Build output
│   ├── vercel.json     # Vercel config
│   ├── vite.config.ts
│   └── package.json
├── server/             # Backend → Render
└── shared/             # Shared types
```

---

## 🔧 Key Configurations

### client/vercel.json
```json
{
  "rewrites": [
    { "source": "/api/(.*)", 
      "destination": "https://jaki-global-site.onrender.com/api/$1" }
  ]
}
```

All API calls are automatically proxied to your Render backend.

---

## 📚 Documentation

- **TAILWIND_FIX_COMPLETE.md** - Tailwind CSS fix details
- **DEPLOYMENT_CHECKLIST.md** - Pre-deployment verification
- **VERCEL_DEPLOYMENT_READY.md** - Full deployment guide

---

## ✅ Status: Ready to Deploy

Your repository is fully configured for clean split deployment with working Tailwind CSS.
