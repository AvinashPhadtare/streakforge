from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from datetime import date
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from uuid import UUID


def get_all(db: Session, user_id: UUID) -> List[Habit]:
    return db.execute(select(Habit).where(and_(Habit.user_id == user_id, Habit.is_active == True))).scalars().all()


def get_by_id(db: Session, habit_id: UUID, user_id: UUID) -> Optional[Habit]:
    return db.execute(select(Habit).where(and_(Habit.id == habit_id, Habit.user_id == user_id))).scalar_one_or_none()


def create(db: Session, user_id: UUID, name: str, description: Optional[str] = None, category: Optional[str] = None, frequency: str = "daily", target_days: Optional[List[int]] = None) -> Habit:
    habit = Habit(
        user_id=user_id,
        name=name,
        description=description,
        category=category,
        frequency=frequency,
        target_days=target_days
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


def update(db: Session, habit: Habit, data: dict) -> Habit:
    for key, value in data.items():
        setattr(habit, key, value)
    db.commit()
    db.refresh(habit)
    return habit


def delete(db: Session, habit: Habit) -> bool:
    db.delete(habit)
    db.commit()
    return True


def get_log(db: Session, habit_id: UUID, log_date: date) -> Optional[HabitLog]:
    return db.execute(
        select(HabitLog).where(and_(HabitLog.habit_id == habit_id, HabitLog.date == log_date))
    ).scalar_one_or_none()


def create_log(db: Session, habit_id: UUID, user_id: UUID, log_date: date, notes: Optional[str] = None) -> HabitLog:
    log = HabitLog(
        habit_id=habit_id,
        user_id=user_id,
        date=log_date,
        notes=notes
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_logs_for_date(db: Session, user_id: UUID, log_date: date) -> List[HabitLog]:
    return db.execute(
        select(HabitLog).where(and_(HabitLog.user_id == user_id, HabitLog.date == log_date))
    ).scalars().all()


def get_habits_due_today(db: Session, user_id: UUID, today_weekday: int) -> List[Habit]:
    habits = get_all(db, user_id)
    due_habits = []
    for habit in habits:
        if habit.frequency == "daily":
            due_habits.append(habit)
        elif habit.frequency == "weekdays" and today_weekday in [0, 1, 2, 3, 4]:
            due_habits.append(habit)
        elif habit.frequency == "weekends" and today_weekday in [5, 6]:
            due_habits.append(habit)
        elif habit.frequency == "custom" and habit.target_days and today_weekday in habit.target_days:
            due_habits.append(habit)
    return due_habits
