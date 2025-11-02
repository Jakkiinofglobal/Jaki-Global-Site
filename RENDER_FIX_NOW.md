# RENDER FIX - DO THIS NOW

## THE PROBLEM
Your Render backend is crashing because the DATABASE_URL uses an INTERNAL hostname that doesn't work during startup.

## THE FIX (5 MINUTES)

### Step 1: Fix Render Settings

Go to: https://dashboard.render.com/web/srv-d3u7v2odl3ps73eucf1g/settings

**Change Start Command from:**
```
npm run migrate && node dist/index.js
```

**To:**
```
node dist/index.js
```

**Click "Save Changes"**

### Step 2: Fix DATABASE_URL

Go to: https://dashboard.render.com/web/srv-d3u7v2odl3ps73eucf1g/env

Find your DATABASE_URL. It currently shows something like:
```
postgresql://...@dpg-...a.internal/jakiglobaldb?sslmode=require
```

**Change `.internal` to `.render.com`** so it looks like:
```
postgresql://jakiglobaldb_user:HB6ivFDA1wa0OyLMyELWfqv...@dpg-d438l9ngi27c73fs5i90-a.render.com/jakiglobaldb?sslmode=require
```

**Click "Save"**

### Step 3: Let It Deploy

Render will automatically redeploy. Wait 2-3 minutes.

### Step 4: Run Migration Once

After the service is running:

1. Go to your Render service page
2. Click "Shell" tab
3. Run this command:
```bash
npm run db:push
```

## DONE!

Your site will work. Vercel frontend → Render backend → Database all connected.

## Environment Variables You Need in Render

Make sure you have these (you already do based on screenshots):
- ✅ DATABASE_URL (fixed above)
- ✅ ADMIN_EMAIL
- ✅ ADMIN_PASSWORD  
- ✅ SESSION_SECRET
- ✅ PAYPAL_CLIENT_ID
- ✅ PAYPAL_CLIENT_SECRET
- ✅ PRINTIFY_API_TOKEN

All good!
