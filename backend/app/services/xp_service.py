from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from datetime import datetime
from app.models.user import User
from app.repositories.xp_repository import create_transaction, get_recent
from uuid import UUID

TASK_COMPLETED = 10
TASK_HIGH_PRIORITY = 20
HABIT_COMPLETED = 5
DAY_PARTIAL = 20
DAY_SUCCESS = 50
DAY_PERFECT = 100
STREAK_7_DAYS = 100
STREAK_30_DAYS = 500
STREAK_100_DAYS = 2000

LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 18000, 26000, 36000, 50000]


def award_xp(db: Session, user_id: UUID, amount: int, reason: str, source_type: str, source_id: Optional[UUID] = None) -> None:
    create_transaction(db, user_id, amount, reason, source_type, source_id)
    user = db.execute(select(User).where(User.id == user_id)).scalar_one()

    new_level = calculate_level(user.xp)
    if new_level > user.level:
        user.level = new_level
        db.commit()
        db.refresh(user)


def calculate_level(total_xp: int) -> int:
    for i, threshold in enumerate(LEVEL_THRESHOLDS):
        if total_xp < threshold:
            return i
    return len(LEVEL_THRESHOLDS)


def get_level_info(db: Session, user_id: UUID) -> dict:
    user = db.execute(select(User).where(User.id == user_id)).scalar_one()
    level = calculate_level(user.xp)

    xp_for_next_level = None
    xp_progress_percentage = 0.0

    if level < len(LEVEL_THRESHOLDS):
        xp_for_next_level = LEVEL_THRESHOLDS[level]
        if xp_for_next_level:
            prev_threshold = LEVEL_THRESHOLDS[level - 1] if level > 0 else 0
            xp_progress_percentage = ((user.xp - prev_threshold) / (xp_for_next_level - prev_threshold)) * 100

    recent_transactions = get_recent(db, user_id, 5)

    return {
        "xp": user.xp,
        "level": level,
        "xp_for_next_level": xp_for_next_level,
        "xp_progress_percentage": xp_progress_percentage,
        "recent_transactions": recent_transactions
    }
