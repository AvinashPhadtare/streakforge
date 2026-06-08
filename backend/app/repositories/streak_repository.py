from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.streak import Streak
from uuid import UUID


def get_streak_by_user(db: Session, user_id: UUID) -> Optional[Streak]:
    return db.execute(select(Streak).where(Streak.user_id == user_id)).scalar_one_or_none()


def get_or_create_streak(db: Session, user_id: UUID) -> Streak:
    streak = get_streak_by_user(db, user_id)
    if not streak:
        streak = Streak(user_id=user_id)
        db.add(streak)
        db.commit()
        db.refresh(streak)
    return streak


def update_streak(db: Session, streak: Streak, data: dict) -> Streak:
    for key, value in data.items():
        setattr(streak, key, value)
    db.commit()
    db.refresh(streak)
    return streak
