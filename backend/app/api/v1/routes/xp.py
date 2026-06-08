from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.xp import LevelResponse, XPTransactionResponse
from app.services.auth_service import get_current_user
from app.services.xp_service import get_level_info, get_recent

router = APIRouter(prefix="/xp", tags=["xp"])


@router.get("/me", response_model=LevelResponse)
def get_my_level_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    level_info = get_level_info(db, current_user.id)
    return level_info


@router.get("/history", response_model=list[XPTransactionResponse])
def get_my_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_recent(db, current_user.id, 20)
