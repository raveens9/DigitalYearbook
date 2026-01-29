from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import Report
from app.models.post import Post
from app.models.comment import Comment
from app.schemas.report import ReportCreate
from sqlalchemy import select


class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, reporter_id: int, data: ReportCreate) -> Report:
        """Create a new report."""
        # Verify the target exists
        if data.post_id:
            result = await self.db.execute(
                select(Post).where(Post.id == data.post_id)
            )
            if not result.scalar_one_or_none():
                raise ValueError("Post not found")
        
        if data.comment_id:
            result = await self.db.execute(
                select(Comment).where(Comment.id == data.comment_id)
            )
            if not result.scalar_one_or_none():
                raise ValueError("Comment not found")
        
        report = Report(
            reporter_id=reporter_id,
            post_id=data.post_id,
            comment_id=data.comment_id,
            reason=data.reason,
        )
        self.db.add(report)
        await self.db.commit()
        await self.db.refresh(report)
        
        return report
