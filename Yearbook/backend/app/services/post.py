from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.models.post import Post
from app.models.like import Like
from app.models.user import User
from app.schemas.post import PostCreate, PostUpdate


class PostService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, data: PostCreate) -> Post:
        """Create a new post."""
        post = Post(
            user_id=user_id,
            content=data.content,
            image_url=data.image_url,
        )
        self.db.add(post)
        await self.db.commit()
        await self.db.refresh(post)
        
        # Load author relationship
        result = await self.db.execute(
            select(Post)
            .options(selectinload(Post.author))
            .where(Post.id == post.id)
        )
        return result.scalar_one()

    async def get_by_id(self, post_id: int) -> Optional[Post]:
        """Get a post by ID with author loaded."""
        result = await self.db.execute(
            select(Post)
            .options(selectinload(Post.author))
            .where(Post.id == post_id)
        )
        return result.scalar_one_or_none()

    async def update(self, post: Post, data: PostUpdate) -> Post:
        """Update a post."""
        update_data = data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(post, field, value)
        
        await self.db.commit()
        await self.db.refresh(post)
        
        return post

    async def delete(self, post: Post) -> None:
        """Delete a post."""
        await self.db.delete(post)
        await self.db.commit()

    async def get_feed(
        self,
        limit: int = 20,
        offset: int = 0,
        current_user_id: Optional[int] = None,
    ) -> Tuple[List[dict], int]:
        """Get paginated feed of posts with stats."""
        # Get total count
        count_result = await self.db.execute(
            select(func.count(Post.id))
        )
        total = count_result.scalar() or 0
        
        # Get posts with author
        result = await self.db.execute(
            select(Post)
            .options(selectinload(Post.author))
            .order_by(Post.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        posts = result.scalars().all()
        
        # Enrich with stats
        enriched_posts = []
        for post in posts:
            post_data = await self._enrich_post(post, current_user_id)
            enriched_posts.append(post_data)
        
        return enriched_posts, total

    async def get_user_posts(
        self,
        user_id: int,
        limit: int = 20,
        offset: int = 0,
        current_user_id: Optional[int] = None,
    ) -> Tuple[List[dict], int]:
        """Get posts by a specific user."""
        # Get total count
        count_result = await self.db.execute(
            select(func.count(Post.id)).where(Post.user_id == user_id)
        )
        total = count_result.scalar() or 0
        
        # Get posts
        result = await self.db.execute(
            select(Post)
            .options(selectinload(Post.author))
            .where(Post.user_id == user_id)
            .order_by(Post.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        posts = result.scalars().all()
        
        enriched_posts = []
        for post in posts:
            post_data = await self._enrich_post(post, current_user_id)
            enriched_posts.append(post_data)
        
        return enriched_posts, total

    async def like(self, post_id: int, user_id: int) -> int:
        """Like a post. Returns new like count."""
        # Check if already liked
        result = await self.db.execute(
            select(Like).where(
                and_(Like.post_id == post_id, Like.user_id == user_id)
            )
        )
        if result.scalar_one_or_none():
            raise ValueError("Post already liked")
        
        like = Like(post_id=post_id, user_id=user_id)
        self.db.add(like)
        await self.db.commit()
        
        return await self._get_likes_count(post_id)

    async def unlike(self, post_id: int, user_id: int) -> int:
        """Unlike a post. Returns new like count."""
        result = await self.db.execute(
            select(Like).where(
                and_(Like.post_id == post_id, Like.user_id == user_id)
            )
        )
        like = result.scalar_one_or_none()
        
        if not like:
            raise ValueError("Post not liked")
        
        await self.db.delete(like)
        await self.db.commit()
        
        return await self._get_likes_count(post_id)

    async def _get_likes_count(self, post_id: int) -> int:
        """Get the number of likes for a post."""
        result = await self.db.execute(
            select(func.count(Like.id)).where(Like.post_id == post_id)
        )
        return result.scalar() or 0

    async def _get_comments_count(self, post_id: int) -> int:
        """Get the number of comments for a post."""
        from app.models.comment import Comment
        result = await self.db.execute(
            select(func.count(Comment.id)).where(Comment.post_id == post_id)
        )
        return result.scalar() or 0

    async def _is_liked_by_user(self, post_id: int, user_id: Optional[int]) -> bool:
        """Check if a post is liked by a user."""
        if not user_id:
            return False
        result = await self.db.execute(
            select(Like).where(
                and_(Like.post_id == post_id, Like.user_id == user_id)
            )
        )
        return result.scalar_one_or_none() is not None

    async def _enrich_post(self, post: Post, current_user_id: Optional[int] = None) -> dict:
        """Enrich a post with stats and like status."""
        likes_count = await self._get_likes_count(post.id)
        comments_count = await self._get_comments_count(post.id)
        is_liked = await self._is_liked_by_user(post.id, current_user_id)
        
        return {
            "id": post.id,
            "content": post.content,
            "image_url": post.image_url,
            "author": {
                "id": post.author.id,
                "username": post.author.username,
                "full_name": post.author.full_name,
                "profile_picture_url": post.author.profile_picture_url,
            },
            "likes_count": likes_count,
            "comments_count": comments_count,
            "is_liked": is_liked,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
        }
