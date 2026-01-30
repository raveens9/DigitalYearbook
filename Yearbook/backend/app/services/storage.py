import os
import uuid
import json
from datetime import timedelta
from typing import BinaryIO, Optional
from google.cloud import storage
from google.oauth2 import service_account
from app.core.config import settings


class CloudStorageService:
    def __init__(self):
        # Initialize GCS client
        # Priority: JSON string > file path > default credentials
        if settings.GCS_CREDENTIALS_JSON:
            # Use hardcoded JSON credentials
            # Clean up the JSON string (remove extra whitespace, handle multiline)
            credentials_json = settings.GCS_CREDENTIALS_JSON.strip()
            
            # If the JSON has unescaped newlines in the private key, escape them
            # This handles cases where the JSON is pasted directly
            try:
                credentials_info = json.loads(credentials_json)
            except json.JSONDecodeError:
                # Try to fix common issues with newlines in private_key
                credentials_json = credentials_json.replace('\n', '\\n')
                credentials_info = json.loads(credentials_json)
            
            credentials = service_account.Credentials.from_service_account_info(
                credentials_info
            )
            self.client = storage.Client(
                credentials=credentials,
                project=settings.GCS_PROJECT_ID
            )
        elif settings.GCS_CREDENTIALS_PATH and os.path.exists(settings.GCS_CREDENTIALS_PATH):
            # Use credentials file
            credentials = service_account.Credentials.from_service_account_file(
                settings.GCS_CREDENTIALS_PATH
            )
            self.client = storage.Client(
                credentials=credentials,
                project=settings.GCS_PROJECT_ID
            )
        else:
            # Use default credentials (for local dev with gcloud auth)
            self.client = storage.Client(project=settings.GCS_PROJECT_ID)
        
        self.bucket_name = settings.GCS_BUCKET_NAME
        
        # Only initialize bucket if bucket name is provided
        if self.bucket_name:
            self.bucket = self.client.bucket(self.bucket_name)
        else:
            self.bucket = None

    def upload_file(
        self,
        file: BinaryIO,
        destination_path: str,
        content_type: str,
        make_public: bool = True
    ) -> str:
        """
        Upload a file to Google Cloud Storage.
        
        Args:
            file: File-like object to upload
            destination_path: Path in the bucket (e.g., 'images/user_123/profile.jpg')
            content_type: MIME type of the file
        if not self.bucket:
            raise ValueError("GCS bucket not configured. Please set GCS_BUCKET_NAME in config.")
        
            make_public: Whether to make the file publicly accessible
            
        Returns:
            Public URL of the uploaded file
        """
        blob = self.bucket.blob(destination_path)
        blob.upload_from_file(file, content_type=content_type, rewind=True)
        
        if make_public:
            blob.make_public()
        
        return blob.public_url

    def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from Google Cloud Storage.
        
        Args:
            file_path: Path of the file in the bucket
            
        Returns:
            True if successful, False otherwise
        """
        try:
            blob = self.bucket.blob(file_path)
            blob.delete()
            return True
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")
            return False

    def generate_signed_url(
        self,
        file_path: str,
        expiration: timedelta = timedelta(hours=1)
    ) -> str:
        """
        Generate a signed URL for private file access.
        
        Args:
            file_path: Path of the file in the bucket
            expiration: How long the URL should be valid
            
        Returns:
            Signed URL
        """
        blob = self.bucket.blob(file_path)
        url = blob.generate_signed_url(expiration=expiration)
        return url

    def generate_upload_path(
        self,
        user_id: int,
        filename: str,
        image_type: str
    ) -> str:
        """
        Generate a unique path for file upload.
        
        Args:
            user_id: ID of the user uploading the file
            filename: Original filename
            image_type: Type of image (profile_picture, post_image, etc.)
            
        Returns:
            Unique path for the file
        """
        # Get file extension
        ext = os.path.splitext(filename)[1]
        if not ext:
            ext = '.jpg'
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{ext}"
        
        # Create path: images/{image_type}/user_{user_id}/{unique_filename}
        path = f"images/{image_type}/user_{user_id}/{unique_filename}"
        
        return path


# Singleton instance
storage_service = CloudStorageService()
