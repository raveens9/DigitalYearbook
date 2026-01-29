from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.post import Post
    from app.models.comment import Comment


class Report(Base):
    __tablename__ = "reports"
    __table_args__ = (
        CheckConstraint(
            "(post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL)",
            name="ck_reports_target"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    reporter_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=True, index=True)
    comment_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True, index=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    reporter: Mapped["User"] = relationship("User", foreign_keys=[reporter_id])
    post: Mapped[Optional["Post"]] = relationship("Post", foreign_keys=[post_id])
    comment: Mapped[Optional["Comment"]] = relationship("Comment", foreign_keys=[comment_id])

    def __repr__(self) -> str:
        return f"<Report(id={self.id}, reporter_id={self.reporter_id}, status={self.status})>"
