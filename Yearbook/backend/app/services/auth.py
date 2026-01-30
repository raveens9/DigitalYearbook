from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.auth import RegisterRequest
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_token_expiry,
)
from app.core.config import settings


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: RegisterRequest) -> User:
        """Register a new user."""
        # Check if email already exists
        result = await self.db.execute(
            select(User).where(User.email == data.email)
        )
        if result.scalar_one_or_none():
            raise ValueError("Email already registered")

        # Generate username from email
        username_base = data.email.split("@")[0].lower()
        username = username_base
        counter = 1
        
        while True:
            result = await self.db.execute(
                select(User).where(User.username == username)
            )
            if not result.scalar_one_or_none():
                break
            username = f"{username_base}{counter}"
            counter += 1

        # [YOUR LOGIC] Hybrid Approval System
        # Check if it is a University Email (@sjp.ac.lk or @foe.sjp.ac.lk)
        email_domain = data.email.lower().split("@")[1]
        is_auto_approved = False

        if "sjp.ac.lk" in email_domain:
            is_auto_approved = True
        
        # Create user
        user = User(
            email=data.email,
            username=username,
            password_hash=get_password_hash(data.password),
            full_name=data.full_name,
            university=data.university,
            graduation_year=data.graduation_year,
            # If university mail -> True. If Gmail -> False.
            is_approved=is_auto_approved
        )
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
        return user

    async def authenticate(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user by email and password."""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        if not user.is_active:
            return None
        
        return user

    async def create_tokens(self, user: User) -> Tuple[str, str]:
        """Create access and refresh tokens for a user."""
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # Store refresh token
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        token_record = RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=expires_at,
        )
        self.db.add(token_record)
        await self.db.commit()
        
        return access_token, refresh_token

    async def refresh_tokens(self, refresh_token: str) -> Optional[Tuple[str, str]]:
        """Refresh tokens using a valid refresh token."""
        payload = decode_token(refresh_token)
        
        if not payload or payload.get("type") != "refresh":
            return None
        
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        # Check if token exists and is not revoked
        result = await self.db.execute(
            select(RefreshToken).where(
                and_(
                    RefreshToken.token == refresh_token,
                    RefreshToken.revoked == False,
                    RefreshToken.expires_at > datetime.now(timezone.utc)
                )
            )
        )
        token_record = result.scalar_one_or_none()
        
        if not token_record:
            return None
        
        # Revoke old token
        token_record.revoked = True
        
        # Get user
        result = await self.db.execute(
            select(User).where(User.id == int(user_id))
        )
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            await self.db.commit()
            return None
        
        # Create new tokens
        new_access = create_access_token(data={"sub": str(user.id)})
        new_refresh = create_refresh_token(data={"sub": str(user.id)})
        
        # Store new refresh token
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        new_token_record = RefreshToken(
            user_id=user.id,
            token=new_refresh,
            expires_at=expires_at,
        )
        self.db.add(new_token_record)
        await self.db.commit()
        
        return new_access, new_refresh

    async def logout(self, refresh_token: str) -> bool:
        """Logout by revoking the refresh token."""
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token == refresh_token)
        )
        token_record = result.scalar_one_or_none()
        
        if token_record:
            token_record.revoked = True
            await self.db.commit()
            return True
        
        return False

    async def revoke_all_tokens(self, user_id: int) -> None:
        """Revoke all refresh tokens for a user."""
        result = await self.db.execute(
            select(RefreshToken).where(
                and_(
                    RefreshToken.user_id == user_id,
                    RefreshToken.revoked == False
                )
            )
        )
        tokens = result.scalars().all()
        
        for token in tokens:
            token.revoked = True
        
        await self.db.commit()