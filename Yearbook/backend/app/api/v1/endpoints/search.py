from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.services.user import UserService
from app.schemas.user import UserSearchResult
from app.models.user import User

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/students", response_model=dict)
async def search_students(
    q: Optional[str] = Query(None, description="Search query for name/username"),
    department: Optional[str] = Query(None, description="Filter by department/faculty"),
    graduation_year: Optional[int] = Query(None, ge=1900, le=2100, description="Filter by graduation year"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search students by name, department, or graduation year.
    At least one filter should be provided for meaningful results.
    """
    service = UserService(db)
    users, total = await service.search(
        query=q,
        department=department,
        graduation_year=graduation_year,
        limit=limit,
        offset=offset,
    )
    
    return {
        "items": [UserSearchResult.model_validate(u) for u in users],
        "total": total,
        "limit": limit,
        "offset": offset,
    }
