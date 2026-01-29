from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import datetime


class ReportCreate(BaseModel):
    post_id: Optional[int] = None
    comment_id: Optional[int] = None
    reason: str = Field(..., min_length=10, max_length=1000)
    
    @model_validator(mode='after')
    def validate_target(self):
        if self.post_id is None and self.comment_id is None:
            raise ValueError('Either post_id or comment_id must be provided')
        if self.post_id is not None and self.comment_id is not None:
            raise ValueError('Only one of post_id or comment_id can be provided')
        return self


class ReportResponse(BaseModel):
    id: int
    reporter_id: int
    post_id: Optional[int] = None
    comment_id: Optional[int] = None
    reason: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
