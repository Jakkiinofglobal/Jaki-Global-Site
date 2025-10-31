# 🔒 STABLE BASELINE: Tailwind Verified / Vercel Clean Deploy

**Date Locked**: October 31, 2025  
**Status**: Production-Ready ✅  
**Label**: "Tailwind Verified / Vercel Clean Deploy"

---

## 🎯 Configuration Checkpoint

This is the verified, production-ready baseline for the Jaki Global project. All future changes should preserve this deployment configuration.

---

## 📋 Critical Configuration Files

### ✅ DO NOT MODIFY These Settings

**1. client/tailwind.config.ts**
```typescript
content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"]
```
⚠️ Paths MUST be relative to `/client`, not repo root

**2. client/vercel.json**
```json
{
  "framework": "vite",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://jaki-global-site.onrender.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**3. client/vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@shared': resolve(__dirname, '../shared')
    }
  },
  build: { outDir: 'dist', emptyOutDir: true }
})
```

---

## 🔧 Deployment Architecture

### Frontend (Vercel)
- **URL**: https://jaki-global-site.vercel.app
- **Deploy from**: `/client` folder
- **Build command**: `npm run build`
- **Output**: `client/dist/`
- **Auto-deploy**: On push to `main` branch

### Backend (Render)
- **URL**: https://jaki-global-site.onrender.com
- **Deploy from**: Repository root
- **Runtime**: Node.js + Express
- **Independent deployment** from frontend

### API Communication
- All frontend `/api/*` requests → Automatically proxy to Render backend
- No code changes needed for API calls
- Configured via Vercel rewrites

---

## ✅ Build Verification Checklist

Before pushing changes, verify:

```bash
cd client && npm run build
```

**Expected output:**
```
✓ 1993+ modules transformed
dist/assets/index-*.css  ~137-138 KB  ✅ (Full Tailwind styles)
dist/assets/index-*.js   ~620 KB
```

**Red flags:**
- ❌ CSS file < 100 KB = Tailwind styles being purged
- ❌ Build errors = Check Tailwind/PostCSS config
- ❌ Missing dist folder = Vite config issue

---

## 🛡️ Protected Patterns

### Never Change:
1. Tailwind content paths in `client/tailwind.config.ts`
2. Vercel API rewrite destination URL
3. Vite build output directory (`dist`)
4. Import alias structure (@, @assets, @shared)

### Safe to Change:
1. React components in `client/src/`
2. Tailwind utility classes in components
3. Custom CSS in `client/src/index.css` (keep @tailwind directives)
4. Package dependencies (test build after)

---

## 📦 Dependency Updates

When updating packages:

```bash
# Frontend updates
cd client && npm update [package]
cd client && npm run build  # ← Verify build works
```

**After any dependency change**:
1. Test local build: `cd client && npm run build`
2. Verify CSS size is ~137-138 KB
3. Test locally: `cd client && npm run preview`
4. Push to GitHub → Vercel auto-deploys

---

## 🚀 Deployment Workflow

### Standard Development Cycle

1. **Develop**: Work in Replit (full-stack dev server)
2. **Test**: Verify locally before pushing
3. **Commit**: 
   ```bash
   git add -A
   git commit -m "Your changes"
   git push origin main
   ```
4. **Auto-Deploy**: 
   - Vercel detects push
   - Builds `/client` automatically
   - Deploys to production
5. **Verify**: Visit https://jaki-global-site.vercel.app

### Render Backend

Backend deploys independently from backend repository/branch settings on Render dashboard.

---

## 🔍 Troubleshooting

### Issue: Vercel shows unstyled content

**Check:**
```bash
cat client/tailwind.config.ts | grep "content:"
```

**Should show:**
```typescript
content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"]
```

**Fix if wrong:**
```bash
# Edit client/tailwind.config.ts
# Change content paths to be relative to /client
git add client/tailwind.config.ts
git commit -m "Fix: Tailwind content paths"
git push origin main
```

### Issue: API calls failing on Vercel

**Check:**
```bash
cat client/vercel.json | grep "destination"
```

**Should show:**
```json
"destination": "https://jaki-global-site.onrender.com/api/$1"
```

### Issue: Build fails on Vercel

**Check Vercel logs for:**
- PostCSS errors → Check `client/postcss.config.js`
- Module not found → Check import paths and aliases
- TypeScript errors → Check `client/tsconfig.json`

---

## 📊 Baseline Metrics

**Known Good Values:**
- CSS bundle: 137.85 KB (uncompressed), ~22 KB (gzipped)
- JS bundle: ~620 KB (uncompressed), ~195 KB (gzipped)
- Build time: ~10-15 seconds
- Total modules: ~1993

**If metrics deviate significantly, investigate before deploying.**

---

## 🎯 Future-Proofing

### When adding new components:
- ✅ Use Tailwind utility classes
- ✅ Place in `client/src/components/`
- ✅ Build will auto-include styles (content glob matches)

### When adding new pages:
- ✅ Register in `client/src/App.tsx`
- ✅ Use wouter for routing
- ✅ Vercel rewrites handle SPA routing

### When changing Tailwind config:
- ⚠️ Never change `content` paths
- ✅ Safe to add custom colors, fonts
- ✅ Test build before pushing

---

## ✅ Baseline Locked

This configuration has been tested and verified as production-ready. The deployment pipeline is:

**Replit (Dev)** → **GitHub (Source)** → **Vercel (Frontend)** + **Render (Backend)** → **Production**

All future commits will auto-deploy smoothly as long as the critical configuration files remain unchanged.

**Checkpoint Status**: 🔒 LOCKED AND VERIFIED ✅
