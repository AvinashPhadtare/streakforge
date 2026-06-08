from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.models.habit import Habit
from app.repositories import get_all, get_by_id, create, update, delete, get_log, create_log, get_habits_due_today
from app.services import recalculate_day, award_xp, HABIT_COMPLETED
from uuid import UUID


def is_habit_due_today(habit: Habit, today_weekday: int) -> bool:
    if habit.frequency == "daily":
        return True
    elif habit.frequency == "weekdays" and today_weekday in [0, 1, 2, 3, 4]:
        return True
    elif habit.frequency == "weekends" and today_weekday in [5, 6]:
        return True
    elif habit.frequency == "custom" and habit.target_days and today_weekday in habit.target_days:
        return True
    return False


def get_habits(db: Session, user_id: UUID, today_weekday: int) -> List[Habit]:
    habits = get_all(db, user_id)
    for habit in habits:
        habit.today_completed = get_log(db, habit.id, date.today()) is not None
    return habits


def get_habit(db: Session, habit_id: UUID, user_id: UUID, today_weekday: int) -> Habit:
    habit = get_by_id(db, habit_id, user_id)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    habit.today_completed = get_log(db, habit.id, date.today()) is not None
    return habit


def create_habit(db: Session, user_id: UUID, name: str, description: Optional[str] = None, category: Optional[str] = None, frequency: str = "daily", target_days: Optional[List[int]] = None) -> Habit:
    return create(db, user_id, name, description, category, frequency, target_days)


def update_habit(db: Session, habit_id: UUID, user_id: UUID, data: dict) -> Habit:
    habit = get_by_id(db, habit_id, user_id)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return update(db, habit, data)


def delete_habit(db: Session, habit_id: UUID, user_id: UUID) -> None:
    habit = get_by_id(db, habit_id, user_id)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    delete(db, habit)


def log_habit(db: Session, habit_id: UUID, user_id: UUID, log_date: Optional[date] = None, notes: Optional[str] = None):
    if not log_date:
        log_date = date.today()

    habit = get_by_id(db, habit_id, user_id)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )

    existing_log = get_log(db, habit_id, log_date)
    if existing_log:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Habit already logged for this date"
        )

    create_log(db, habit_id, user_id, log_date, notes)
    habit.total_completions += 1

    yesterday = log_date - timedelta(days=1)
    yesterday_log = get_log(db, habit_id, yesterday)
    if yesterday_log:
        habit.current_streak += 1
    else:
        habit.current_streak = 1

    if habit.current_streak > habit.longest_streak:
        habit.longest_streak = habit.current_streak

    db.commit()
    db.refresh(habit)

    award_xp(db, user_id, HABIT_COMPLETED, "Habit completed", "habit", habit_id)
    recalculate_day(db, user_id, log_date)
