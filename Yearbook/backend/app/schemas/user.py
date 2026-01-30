from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Dict, Any
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)
    university: str = Field(..., min_length=1, max_length=200)
    graduation_year: int = Field(..., ge=1900, le=2100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    faculty: Optional[str] = Field(None, max_length=200)
    interests: Optional[str] = Field(None, max_length=500)
    socials: Optional[Dict[str, str]] = None
    profile_picture_url: Optional[str] = Field(None, max_length=500)
    yearbook_quote: Optional[str] = Field(None, max_length=300)
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            # Username must be alphanumeric with underscores
            if not v.replace('_', '').isalnum():
                raise ValueError('Username must contain only letters, numbers, and underscores')
        return v


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    full_name: str
    university: str
    graduation_year: int
    bio: Optional[str] = None
    faculty: Optional[str] = None
    interests: Optional[str] = None
    socials: Optional[Dict[str, Any]] = None
    profile_picture_url: Optional[str] = None
    yearbook_quote: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserPublicResponse(BaseModel):
    """Public profile response (excludes sensitive data)"""
    id: int
    username: str
    full_name: str
    university: str
    graduation_year: int
    bio: Optional[str] = None
    faculty: Optional[str] = None
    interests: Optional[str] = None
    socials: Optional[Dict[str, Any]] = None
    profile_picture_url: Optional[str] = None
    yearbook_quote: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserSearchResult(BaseModel):
    id: int
    username: str
    full_name: str
    university: str
    graduation_year: int
    faculty: Optional[str] = None
    profile_picture_url: Optional[str] = None
    yearbook_quote: Optional[str] = None

    class Config:
        from_attributes = True
