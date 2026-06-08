from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.streak import StreakResponse
from app.services.auth_service import get_current_user
from app.services.streak_service import get_streak

router = APIRouter(prefix="/streaks", tags=["streaks"])


@router.get("/me", response_model=StreakResponse)
def get_my_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    streak = get_streak(db, current_user.id)
    return StreakResponse.model_validate(streak)
