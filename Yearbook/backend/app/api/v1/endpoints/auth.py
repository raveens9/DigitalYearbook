from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.services.auth import AuthService
from app.schemas.auth import (
    TokenPair,
    LoginRequest,
    RegisterRequest,
    RefreshTokenRequest,
    LogoutRequest,
)
from app.schemas.user import UserResponse
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    service = AuthService(db)
    try:
        user = await service.register(data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=TokenPair)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email and password to get access and refresh tokens."""
    service = AuthService(db)
    user = await service.authenticate(data.email, data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token, refresh_token = await service.create_tokens(user)
    
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh", response_model=TokenPair)
async def refresh_tokens(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Refresh access token using a valid refresh token."""
    service = AuthService(db)
    tokens = await service.refresh_tokens(data.refresh_token)
    
    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token, refresh_token = tokens
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    data: LogoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Logout by revoking the refresh token."""
    service = AuthService(db)
    await service.logout(data.refresh_token)
    return None


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's information."""
    return current_user
