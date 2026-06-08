from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.streak import Streak
from app.repositories import get_or_create_streak, update_streak
from app.repositories.daily_record_repository import get_by_date
from uuid import UUID


def recalculate_streak(db: Session, user_id: UUID) -> Streak:
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    streak = get_or_create_streak(db, user_id)
    daily_record = get_by_date(db, user_id, today)
    
    if not daily_record:
        return streak
    
    # Check if today is active (partial, success, perfect)
    is_active = daily_record.day_status in ["partial", "success", "perfect"]
    
    if is_active:
        if streak.last_active_date == yesterday:
            streak.current_streak += 1
        elif streak.last_active_date == today:
            # Already counted today, do nothing
            pass
        else:
            # Reset to 1 (new start)
            streak.current_streak = 1
        
        # Check if this is a new day we haven't counted before
        if streak.last_active_date != today:
            streak.total_active_days += 1
        
        streak.last_active_date = today
    else:
        # Today is missed, reset streak
        streak.current_streak = 0
    
    # Update longest streak if needed
    if streak.current_streak > streak.longest_streak:
        streak.longest_streak = streak.current_streak
    
    db.commit()
    db.refresh(streak)
    return streak


def get_streak(db: Session, user_id: UUID) -> Streak:
    # Recalculate to ensure it's fresh
    return recalculate_streak(db, user_id)
