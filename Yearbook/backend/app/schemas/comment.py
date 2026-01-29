from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class CommentCreate(CommentBase):
    pass


class CommentUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=1000)


class CommentAuthor(BaseModel):
    id: int
    username: str
    full_name: str
    profile_picture_url: Optional[str] = None

    class Config:
        from_attributes = True


class CommentResponse(BaseModel):
    id: int
    post_id: int
    content: str
    author: CommentAuthor
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommentListResponse(BaseModel):
    items: List[CommentResponse]
    total: int
    limit: int
    offset: int
