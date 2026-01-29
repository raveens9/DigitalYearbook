from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.services.report import ReportService
from app.schemas.report import ReportCreate, ReportResponse
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    data: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Report a post or comment for moderation review.
    Provide either post_id OR comment_id, not both.
    """
    service = ReportService(db)
    try:
        report = await service.create(current_user.id, data)
        return report
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
