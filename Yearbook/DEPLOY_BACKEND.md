# Backend Deployment Guide

## Option 1: Railway (Recommended - Easy & Free Tier)

### 1. Prepare Your Backend

1. **Create `Procfile`** in backend directory:

```bash
cd /Users/raveenshenuka/Desktop/Yearbook/backend
```

Create file:

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

2. **Create `railway.json`** (optional, for build configuration):

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up/login with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. **IMPORTANT**: After Railway creates the service, go to **Settings** tab
5. Scroll down to **Service Settings**
6. Set **Root Directory** to: `backend`
7. Click **Save**
8. Railway will automatically redeploy with the correct directory

### 3. Configure Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```
DATABASE_URL=your-neon-database-url
SECRET_KEY=your-secret-key
CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:5173
GCS_PROJECT_ID=your-gcs-project-id
GCS_BUCKET_NAME=your-bucket-name
GCS_CREDENTIALS_JSON={"type":"service_account",...}
ENV=production
```

### 4. Deploy

Railway will automatically deploy. Your backend URL will be: `https://your-app.railway.app`

---

## Option 2: Render

### 1. Create `render.yaml`

In backend directory:

```yaml
services:
  - type: web
    name: yearbook-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SECRET_KEY
        sync: false
      - key: CORS_ORIGINS
        sync: false
      - key: GCS_PROJECT_ID
        sync: false
      - key: GCS_BUCKET_NAME
        sync: false
      - key: GCS_CREDENTIALS_JSON
        sync: false
```

### 2. Deploy to Render

1. Go to [render.com](https://render.com) and sign up
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in the dashboard
6. Click **Create Web Service**

---

## Option 3: Google Cloud Run (More Complex, Scalable)

### 1. Create `Dockerfile` in backend directory:

```dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run the application
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 2. Create `.dockerignore`:

```
__pycache__
*.pyc
*.pyo
*.pyd
.Python
venv/
.env
*.log
.git
.gitignore
```

### 3. Deploy to Cloud Run:

```bash
# Install Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Build and deploy
cd backend
gcloud run deploy yearbook-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="your-db-url",SECRET_KEY="your-key" \
  --max-instances 10
```

---

## Important: Update CORS After Deployment

After deploying frontend, update `CORS_ORIGINS` in your backend environment variables:

```
CORS_ORIGINS=https://your-frontend-domain.vercel.app,https://your-frontend-domain.netlify.app
```

Then redeploy/restart your backend.

---

## Troubleshooting

### Port Issues

- Railway/Render automatically set `$PORT` environment variable
- Make sure your app uses it: `--port $PORT`

### Database Connection

- Verify DATABASE_URL includes `postgresql+asyncpg://` prefix
- Test connection from deployment logs

### GCS Credentials

- For Railway/Render: Use `GCS_CREDENTIALS_JSON` environment variable
- For Cloud Run: Use service account with Cloud Run service

### CORS Errors

- Add your frontend domain to `CORS_ORIGINS`
- Restart backend after updating
