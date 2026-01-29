from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserSearchResult


class PostBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    image_url: Optional[str] = Field(None, max_length=500)


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=5000)
    image_url: Optional[str] = Field(None, max_length=500)


class PostAuthor(BaseModel):
    id: int
    username: str
    full_name: str
    profile_picture_url: Optional[str] = None

    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    id: int
    content: str
    image_url: Optional[str] = None
    author: PostAuthor
    likes_count: int = 0
    comments_count: int = 0
    is_liked: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    items: List[PostResponse]
    total: int
    limit: int
    offset: int


class LikeResponse(BaseModel):
    message: str
    likes_count: int
