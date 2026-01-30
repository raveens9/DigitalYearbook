from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func

from app.models.user import User
from app.schemas.user import UserUpdate


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Get a user by ID."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        """Get a user by username."""
        result = await self.db.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        """Get a user by email."""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def update(self, user: User, data: UserUpdate) -> User:
        """Update user profile."""
        update_data = data.model_dump(exclude_unset=True)
        
        # Check username uniqueness if updating
        if "username" in update_data:
            existing = await self.get_by_username(update_data["username"])
            if existing and existing.id != user.id:
                raise ValueError("Username already taken")
        
        # Prevent editing yearbook_quote if it's already set
        if "yearbook_quote" in update_data:
            if user.yearbook_quote is not None and user.yearbook_quote != "":
                # Remove yearbook_quote from update_data if it's already set
                update_data.pop("yearbook_quote")
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        await self.db.commit()
        await self.db.refresh(user)
        
        return user

    async def search(
        self,
        query: Optional[str] = None,
        department: Optional[str] = None,
        graduation_year: Optional[int] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Tuple[List[User], int]:
        """Search users by name, department, or graduation year."""
        stmt = select(User).where(User.is_active == True)
        count_stmt = select(func.count(User.id)).where(User.is_active == True)
        
        if query:
            search_filter = or_(
                User.full_name.ilike(f"%{query}%"),
                User.username.ilike(f"%{query}%"),
            )
            stmt = stmt.where(search_filter)
            count_stmt = count_stmt.where(search_filter)
        
        if department:
            stmt = stmt.where(User.faculty.ilike(f"%{department}%"))
            count_stmt = count_stmt.where(User.faculty.ilike(f"%{department}%"))
        
        if graduation_year:
            stmt = stmt.where(User.graduation_year == graduation_year)
            count_stmt = count_stmt.where(User.graduation_year == graduation_year)
        
        # Get total count
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar() or 0
        
        # Get paginated results
        stmt = stmt.order_by(User.full_name).offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        users = list(result.scalars().all())
        
        return users, total
