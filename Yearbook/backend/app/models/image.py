from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class ImageType(str, enum.Enum):
    PROFILE_PICTURE = "profile_picture"
    POST_IMAGE = "post_image"
    POST_ATTACHMENT = "post_attachment"


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    image_type = Column(Enum(ImageType), nullable=False, index=True)
    gcs_bucket = Column(String(255), nullable=False)
    gcs_path = Column(String(500), nullable=False)
    public_url = Column(String(1000), nullable=False)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(100))
    size_bytes = Column(Integer)
    
    # Optional: Link to post if it's a post image
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
