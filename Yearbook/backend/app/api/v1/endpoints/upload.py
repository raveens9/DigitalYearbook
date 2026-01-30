from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.image import Image, ImageType
from app.services.storage import storage_service
from app.schemas.image import ImageResponse
from typing import Optional

router = APIRouter()

# Allowed image types and max file size
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/image", response_model=ImageResponse)
async def upload_image(
    file: UploadFile = File(...),
    image_type: str = Form(...),
    post_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload an image to Google Cloud Storage.
    
    - **file**: Image file to upload
    - **image_type**: Type of image (profile_picture, post_image, post_attachment)
    - **post_id**: Optional post ID if this is a post image
    """
    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_CONTENT_TYPES)}"
        )
    
    # Validate image type
    try:
        ImageType(image_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image_type. Must be one of: {', '.join([t.value for t in ImageType])}"
        )
    
    # Read file content
    file_content = await file.read()
    
    # Validate file size
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE / (1024*1024)}MB"
        )
    
    # Generate upload path
    gcs_path = storage_service.generate_upload_path(
        user_id=current_user.id,
        filename=file.filename or "image",
        image_type=image_type
    )
    
    try:
        # Upload to GCS
        from io import BytesIO
        file_obj = BytesIO(file_content)
        public_url = storage_service.upload_file(
            file=file_obj,
            destination_path=gcs_path,
            content_type=file.content_type,
            make_public=True
        )
        
        # Save to database
        image = Image(
            user_id=current_user.id,
            image_type=image_type,
            gcs_bucket=storage_service.bucket_name,
            gcs_path=gcs_path,
            public_url=public_url,
            filename=file.filename or "image",
            content_type=file.content_type,
            size_bytes=len(file_content),
            post_id=post_id
        )
        
        db.add(image)
        await db.commit()
        await db.refresh(image)
        
        # Update user profile picture if this is a profile picture
        if image_type == ImageType.PROFILE_PICTURE:
            current_user.profile_picture_url = public_url
            await db.commit()
        
        return image
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.delete("/image/{image_id}")
async def delete_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete an image from Google Cloud Storage and database.
    """
    # Get image from database
    result = await db.execute(
        select(Image).where(Image.id == image_id, Image.user_id == current_user.id)
    )
    image = result.scalar_one_or_none()
    
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Delete from GCS
    storage_service.delete_file(image.gcs_path)
    
    # Delete from database
    await db.delete(image)
    await db.commit()
    
    return {"success": True, "message": "Image deleted successfully"}
