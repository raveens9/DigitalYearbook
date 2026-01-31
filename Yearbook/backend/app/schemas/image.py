from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ImageCreate(BaseModel):
    image_type: str
    post_id: Optional[int] = None


class ImageResponse(BaseModel):
    id: int
    user_id: int
    image_type: str
    public_url: str
    filename: str
    content_type: Optional[str]
    size_bytes: Optional[int]
    post_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
