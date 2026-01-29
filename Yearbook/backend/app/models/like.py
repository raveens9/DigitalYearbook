from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Integer, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.post import Post


class Like(Base):
    __tablename__ = "likes"
    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="uq_likes_post_user"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    post_id: Mapped[int] = mapped_column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="likes")
    post: Mapped["Post"] = relationship("Post", back_populates="likes")

    def __repr__(self) -> str:
        return f"<Like(id={self.id}, post_id={self.post_id}, user_id={self.user_id})>"
