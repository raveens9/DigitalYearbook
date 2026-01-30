# Frontend Deployment Guide

## Option 1: Vercel (Recommended - Easy & Free)

### 1. Prepare Your Frontend

1. **Update API URL for production**

In `frontend/src/api/client.ts`, ensure you're using environment variable:

```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
```

2. **Create `.env.production`** in frontend directory:

```
VITE_API_URL=https://your-backend.railway.app
```

3. **Ensure `dist` is in `.gitignore`**:

```
dist
node_modules
.env.local
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New** → **Project**
3. Import your repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (if monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend.railway.app` (your backend URL)
6. Click **Deploy**

Your frontend will be live at: `https://your-project.vercel.app`

### 3. Update Backend CORS

After deployment, add your Vercel URL to backend's `CORS_ORIGINS`:

```
CORS_ORIGINS=https://your-project.vercel.app
```

---

## Option 2: Netlify

### 1. Create `netlify.toml` in frontend directory:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

### 2. Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up
2. Click **Add new site** → **Import an existing project**
3. Connect to GitHub and select your repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Click **Show advanced** and add environment variables:
   - `VITE_API_URL`: Your backend URL
6. Click **Deploy site**

Your site will be at: `https://your-site.netlify.app`

---

## Option 3: AWS S3 + CloudFront (Static Hosting)

### 1. Build for Production

```bash
cd frontend
VITE_API_URL=https://your-backend-url.com npm run build
```

### 2. Create S3 Bucket

```bash
aws s3 mb s3://yearbook-frontend
aws s3 website s3://yearbook-frontend --index-document index.html --error-document index.html
```

### 3. Upload Build

```bash
cd dist
aws s3 sync . s3://yearbook-frontend --acl public-read
```

### 4. Configure CloudFront (Optional, for HTTPS)

1. Go to AWS CloudFront console
2. Create distribution pointing to your S3 bucket
3. Configure custom domain and SSL certificate

---

## Custom Domain Setup

### For Vercel:

1. Go to project **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed

### For Netlify:

1. Go to **Domain settings**
2. Add custom domain
3. Update DNS records as instructed

---

## Environment Variables

### Development (.env.local):

```
VITE_API_URL=http://localhost:8000
```

### Production (.env.production):

```
VITE_API_URL=https://your-backend-url.railway.app
```

**Important**: Never commit `.env.local` or production secrets to Git!

---

## Continuous Deployment

Both Vercel and Netlify automatically redeploy when you push to your main branch:

1. **Push changes**:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

2. **Automatic deployment** happens within 1-2 minutes

3. **Preview deployments** are created for pull requests

---

## Troubleshooting

### API Not Reachable

- Check `VITE_API_URL` environment variable in deployment
- Verify backend CORS includes frontend domain
- Check browser console for CORS errors

### Build Fails

- Check Node.js version (use 18 or 20)
- Run `npm install` and `npm run build` locally first
- Check build logs in deployment platform

### Routes Not Working (404)

- Add redirect rules (already in `netlify.toml`)
- For Vercel: Add `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Environment Variables Not Working

- Make sure variables start with `VITE_`
- Redeploy after adding/changing variables
- Clear cache and rebuild

---

## Performance Optimization

### 1. Enable Gzip/Brotli Compression

- Vercel/Netlify do this automatically

### 2. Add Cache Headers

Both platforms automatically set optimal cache headers for static assets.

### 3. Image Optimization

Consider using Vercel's Image Optimization or Cloudinary for images.

---

## Monitoring

### Vercel:

- Built-in analytics at project dashboard
- Real-time deployment logs
- Performance insights

### Netlify:

- Analytics (paid feature)
- Deploy logs
- Split testing support
