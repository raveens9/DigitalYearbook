from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.services.comment import CommentService
from app.services.post import PostService
from app.schemas.comment import (
    CommentCreate,
    CommentUpdate,
    CommentResponse,
    CommentListResponse,
    CommentAuthor,
)
from app.models.user import User

router = APIRouter(prefix="/posts/{post_id}/comments", tags=["Comments"])


@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: int,
    data: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a comment on a post."""
    # Verify post exists
    post_service = PostService(db)
    post = await post_service.get_by_id(post_id)
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    service = CommentService(db)
    comment = await service.create(post_id, current_user.id, data)
    
    return CommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        content=comment.content,
        author=CommentAuthor(
            id=comment.author.id,
            username=comment.author.username,
            full_name=comment.author.full_name,
            profile_picture_url=comment.author.profile_picture_url,
        ),
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


@router.get("", response_model=CommentListResponse)
async def get_comments(
    post_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Get comments for a post with pagination."""
    # Verify post exists
    post_service = PostService(db)
    post = await post_service.get_by_id(post_id)
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    service = CommentService(db)
    comments, total = await service.get_post_comments(
        post_id=post_id,
        limit=limit,
        offset=offset,
    )
    
    items = [
        CommentResponse(
            id=c.id,
            post_id=c.post_id,
            content=c.content,
            author=CommentAuthor(
                id=c.author.id,
                username=c.author.username,
                full_name=c.author.full_name,
                profile_picture_url=c.author.profile_picture_url,
            ),
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in comments
    ]
    
    return CommentListResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    post_id: int,
    comment_id: int,
    data: CommentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a comment (only by owner)."""
    service = CommentService(db)
    comment = await service.get_by_id(comment_id)
    
    if not comment or comment.post_id != post_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this comment"
        )
    
    updated = await service.update(comment, data)
    
    return CommentResponse(
        id=updated.id,
        post_id=updated.post_id,
        content=updated.content,
        author=CommentAuthor(
            id=updated.author.id,
            username=updated.author.username,
            full_name=updated.author.full_name,
            profile_picture_url=updated.author.profile_picture_url,
        ),
        created_at=updated.created_at,
        updated_at=updated.updated_at,
    )


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    post_id: int,
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a comment (only by owner)."""
    service = CommentService(db)
    comment = await service.get_by_id(comment_id)
    
    if not comment or comment.post_id != post_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )
    
    await service.delete(comment)
    return None
