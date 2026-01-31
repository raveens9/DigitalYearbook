# Google Cloud Storage Setup Guide

## 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name (e.g., "yearbook-app")
5. Click "Create"

## 2. Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for and enable:
   - **Cloud Storage API**
   - **Cloud Storage JSON API**

## 3. Create a Storage Bucket

1. Go to **Cloud Storage > Buckets**
2. Click **Create Bucket**

3. **Bucket Configuration:**
   - **Name**: Choose a globally unique name (e.g., `yearbook-images-prod`)
     - Must be lowercase, no spaces
     - Can contain hyphens and numbers
   - **Location Type**:
     - **Multi-region** for better availability (e.g., `US`, `EU`, `ASIA`)
     - OR **Single region** for lower latency (e.g., `us-east1`)
   - **Storage Class**:
     - **Standard** (recommended for frequently accessed images)
   - **Access Control**:
     - Choose **Uniform** (recommended)
   - **Protection**:
     - Leave defaults or enable versioning if needed
   - **Encryption**:
     - Google-managed key (default) is fine

4. Click **Create**

## 4. Configure Bucket Permissions (Make Public)

### Option A: Make entire bucket public (simpler)

1. Go to your bucket
2. Click on **Permissions** tab
3. Click **Grant Access**
4. Add principal: `allUsers`
5. Select role: **Storage Object Viewer**
6. Click **Save**
7. Click **Allow Public Access** in the warning dialog

### Option B: Set CORS (for direct browser uploads - optional)

1. Click on your bucket
2. Go to **Configuration** tab
3. Click **Edit** under CORS
4. Add CORS configuration:

```json
[
  {
    "origin": ["http://localhost:5173", "https://your-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

5. Click **Save**

## 5. Create Service Account & Credentials

1. Go to **IAM & Admin > Service Accounts**
2. Click **Create Service Account**
3. Enter details:
   - **Name**: `yearbook-storage-service`
   - **Description**: "Service account for Yearbook app storage"
4. Click **Create and Continue**

5. **Grant Permissions**:
   - Role: **Storage Object Admin** (for full control)
   - OR **Storage Object Creator** + **Storage Object Viewer** (for upload/read only)
6. Click **Continue** > **Done**

7. **Create JSON Key**:
   - Click on the newly created service account
   - Go to **Keys** tab
   - Click **Add Key** > **Create new key**
   - Choose **JSON**
   - Click **Create**
   - **Save the downloaded JSON file securely!**

## 6. Configure Your Application

1. **Place the credentials file** in your backend directory:

   ```
   /Users/raveenshenuka/Desktop/Yearbook/backend/gcs-credentials.json
   ```

2. **Update your `.env` file** (or config):

   ```env
   GCS_PROJECT_ID=your-project-id
   GCS_BUCKET_NAME=yearbook-images-prod
   GCS_CREDENTIALS_PATH=/Users/raveenshenuka/Desktop/Yearbook/backend/gcs-credentials.json
   ```

3. **Install dependencies**:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Restart your backend server**

## 7. Test the Upload

You can test with curl:

```bash
curl -X POST "http://localhost:8000/api/v1/image" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "image_type=profile_picture"
```

## Security Best Practices

1. **Never commit credentials to Git**:
   - Add to `.gitignore`:
     ```
     gcs-credentials.json
     .env
     ```

2. **Use environment variables** in production

3. **Restrict service account permissions** to only what's needed

4. **Enable bucket versioning** for important data

5. **Set up lifecycle rules** to delete old/unused images

## Folder Structure in Bucket

The service will organize files like this:

```
bucket-name/
  images/
    profile_picture/
      user_123/
        uuid-filename.jpg
    post_image/
      user_456/
        uuid-filename.jpg
    post_attachment/
      user_789/
        uuid-filename.jpg
```

## Cost Considerations

- **Storage**: ~$0.020 per GB/month (Standard class)
- **Operations**: Very minimal for image serving
- **Bandwidth**: Free for most use cases within GCP
- **Estimate**: For 10K images (~50MB average) = ~$10/month

## Troubleshooting

### "Permission denied" errors:

- Check service account has correct roles
- Verify credentials file path is correct
- Ensure bucket name matches config

### Images not accessible:

- Make sure bucket or objects are public
- Check CORS configuration if uploading from browser
- Verify public_url in database is correct

### Upload fails:

- Check file size limits (currently 10MB)
- Verify content type is allowed
- Check service account has write permissions
