from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentUpdate


class CommentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, post_id: int, user_id: int, data: CommentCreate) -> Comment:
        """Create a new comment."""
        comment = Comment(
            post_id=post_id,
            user_id=user_id,
            content=data.content,
        )
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        
        # Load author relationship
        result = await self.db.execute(
            select(Comment)
            .options(selectinload(Comment.author))
            .where(Comment.id == comment.id)
        )
        return result.scalar_one()

    async def get_by_id(self, comment_id: int) -> Optional[Comment]:
        """Get a comment by ID."""
        result = await self.db.execute(
            select(Comment)
            .options(selectinload(Comment.author))
            .where(Comment.id == comment_id)
        )
        return result.scalar_one_or_none()

    async def update(self, comment: Comment, data: CommentUpdate) -> Comment:
        """Update a comment."""
        update_data = data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(comment, field, value)
        
        await self.db.commit()
        await self.db.refresh(comment)
        
        return comment

    async def delete(self, comment: Comment) -> None:
        """Delete a comment."""
        await self.db.delete(comment)
        await self.db.commit()

    async def get_post_comments(
        self,
        post_id: int,
        limit: int = 20,
        offset: int = 0,
    ) -> Tuple[List[Comment], int]:
        """Get comments for a post with pagination."""
        # Get total count
        count_result = await self.db.execute(
            select(func.count(Comment.id)).where(Comment.post_id == post_id)
        )
        total = count_result.scalar() or 0
        
        # Get comments
        result = await self.db.execute(
            select(Comment)
            .options(selectinload(Comment.author))
            .where(Comment.post_id == post_id)
            .order_by(Comment.created_at.asc())
            .offset(offset)
            .limit(limit)
        )
        comments = list(result.scalars().all())
        
        return comments, total
