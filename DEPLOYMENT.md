# Deployment Guide: Render (Backend) + Vercel (Frontend)

## Backend Deployment (Render)

1. **Create a Web Service on Render:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Render:**
   - **Name**: Choose a name (e.g., `my-app-backend`)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

3. **Add Environment Variables in Render:**
   - `NODE_ENV=production`
   - Add any other environment variables (database URLs, API keys, etc.)

4. **Deploy** - Render will build and deploy your backend
   - Your backend URL will be: `https://my-app-backend.onrender.com`

## Frontend Deployment (Vercel)

1. **Update vercel.json:**
   - Replace `YOUR-RENDER-BACKEND.onrender.com` with your actual Render URL
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://my-app-backend.onrender.com/api/:path*"
       }
     ]
   }
   ```

2. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Add Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL=https://my-app-backend.onrender.com`
   - Make sure to set it for Production, Preview, and Development

4. **Deploy** - Vercel will build and deploy your frontend

## Important Notes

- **CORS**: Your backend needs to allow requests from your Vercel domain
- **Environment Variables**: 
  - Frontend vars in Vercel must be prefixed with `VITE_`
  - Backend vars go directly in Render dashboard
- **Redeploy**: After changing environment variables, redeploy to apply changes
- **Free Tier**: Render free tier sleeps after 15 minutes of inactivity (first request may be slow)

## Troubleshooting

- **Vercel build failing**: Check build logs for missing environment variables
- **API calls failing**: Verify the Render URL in vercel.json matches your actual backend URL
- **CORS errors**: Add CORS middleware to your Express backend with your Vercel URL
