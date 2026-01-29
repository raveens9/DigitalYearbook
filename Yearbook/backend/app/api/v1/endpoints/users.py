from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.services.user import UserService
from app.schemas.user import UserUpdate, UserResponse, UserPublicResponse, UserSearchResult
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get the current user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the current user's profile."""
    service = UserService(db)
    try:
        user = await service.update(current_user, data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/search", response_model=dict)
async def search_users(
    q: Optional[str] = Query(None, description="Search query for name/username"),
    department: Optional[str] = Query(None, description="Filter by department/faculty"),
    graduation_year: Optional[int] = Query(None, ge=1900, le=2100, description="Filter by graduation year"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search users by name, department, or graduation year."""
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


@router.get("/{user_id}", response_model=UserPublicResponse)
async def get_user_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a user's public profile by ID."""
    service = UserService(db)
    user = await service.get_by_id(user_id)
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/username/{username}", response_model=UserPublicResponse)
async def get_user_by_username(
    username: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a user's public profile by username."""
    service = UserService(db)
    user = await service.get_by_username(username)
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user
