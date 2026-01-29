from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user, get_current_user_optional
from app.services.post import PostService
from app.schemas.post import (
    PostCreate,
    PostUpdate,
    PostResponse,
    PostListResponse,
    LikeResponse,
)
from app.models.user import User

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    data: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new post."""
    service = PostService(db)
    post = await service.create(current_user.id, data)
    
    # Enrich with stats
    enriched = await service._enrich_post(post, current_user.id)
    return enriched


@router.get("", response_model=PostListResponse)
async def get_feed(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Get the social feed with pagination."""
    service = PostService(db)
    current_user_id = current_user.id if current_user else None
    posts, total = await service.get_feed(
        limit=limit,
        offset=offset,
        current_user_id=current_user_id,
    )
    
    return PostListResponse(
        items=posts,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/recent", response_model=PostListResponse)
async def get_recent_posts(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Get the most recent posts."""
    service = PostService(db)
    current_user_id = current_user.id if current_user else None
    posts, total = await service.get_feed(
        limit=limit,
        offset=0,
        current_user_id=current_user_id,
    )
    
    return PostListResponse(
        items=posts,
        total=total,
        limit=limit,
        offset=0,
    )


@router.get("/user/{user_id}", response_model=PostListResponse)
async def get_user_posts(
    user_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Get posts by a specific user."""
    service = PostService(db)
    current_user_id = current_user.id if current_user else None
    posts, total = await service.get_user_posts(
        user_id=user_id,
        limit=limit,
        offset=offset,
        current_user_id=current_user_id,
    )
    
    return PostListResponse(
        items=posts,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Get a single post by ID."""
    service = PostService(db)
    post = await service.get_by_id(post_id)
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    current_user_id = current_user.id if current_user else None
    enriched = await service._enrich_post(post, current_user_id)
    return enriched


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    data: PostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a post (only by owner)."""
    service = PostService(db)
    post = await service.get_by_id(post_id)
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this post"
        )
    
    updated = await service.update(post, data)
    enriched = await service._enrich_post(updated, current_user.id)
    return enriched


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a post (only by owner)."""
    service = PostService(db)
    post = await service.get_by_id(post_id)
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this post"
        )
    
    await service.delete(post)
    return None


@router.post("/{post_id}/like", response_model=LikeResponse)
async def like_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Like a post."""
    service = PostService(db)
    post = await service.get_by_id(post_id)
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    try:
        likes_count = await service.like(post_id, current_user.id)
        return LikeResponse(message="Post liked", likes_count=likes_count)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{post_id}/like", response_model=LikeResponse)
async def unlike_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Unlike a post."""
    service = PostService(db)
    post = await service.get_by_id(post_id)
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    try:
        likes_count = await service.unlike(post_id, current_user.id)
        return LikeResponse(message="Post unliked", likes_count=likes_count)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
