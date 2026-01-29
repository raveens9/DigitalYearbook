from pydantic import BaseModel
from typing import Any, Optional


class APIResponse(BaseModel):
    """Standard API response wrapper"""
    success: bool = True
    message: Optional[str] = None
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Standard error response"""
    success: bool = False
    message: str
    detail: Optional[Any] = None
