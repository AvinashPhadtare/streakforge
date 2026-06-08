from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from datetime import date
from app.models.task import Task
from app.models.daily_record import DailyRecord
from app.models.habit_log import HabitLog
from app.repositories import get_or_create, update_record, get_range
from app.repositories.habit_repository import get_habits_due_today
from uuid import UUID


def recalculate_day(db: Session, user_id: UUID, record_date: date) -> DailyRecord:
    # Get or create the daily record
    daily_record = get_or_create(db, user_id, record_date)
    
    # Count total tasks and completed tasks for this date
    tasks = db.execute(
        select(Task).where(
            and_(
                Task.user_id == user_id,
                Task.due_date == record_date
            )
        )
    ).scalars().all()
    
    tasks_total = len(tasks)
    tasks_completed = sum(1 for task in tasks if task.status == "completed")
    
    # Count habits
    weekday = record_date.weekday()
    habits_due = get_habits_due_today(db, user_id, weekday)
    habits_total = len(habits_due)
    habit_logs = db.execute(
        select(HabitLog).where(
            and_(
                HabitLog.user_id == user_id,
                HabitLog.date == record_date
            )
        )
    ).scalars().all()
    habits_completed = len(habit_logs)
    
    # Total and completed
    total = tasks_total + habits_total
    completed = tasks_completed + habits_completed
    
    # Calculate completion percentage
    if total > 0:
        completion_percentage = (completed / total) * 100
    else:
        completion_percentage = 0.0
    
    # Determine day status
    if completion_percentage == 0:
        day_status = "missed"
    elif 1 <= completion_percentage <= 49:
        day_status = "partial"
    elif 50 <= completion_percentage <= 99:
        day_status = "success"
    else:
        day_status = "perfect"
    
    # Calculate day score (0.0 to 100.0)
    day_score = completion_percentage
    
    # Update the daily record
    data = {
        "tasks_total": tasks_total,
        "tasks_completed": tasks_completed,
        "habits_total": habits_total,
        "habits_completed": habits_completed,
        "completion_percentage": completion_percentage,
        "day_status": day_status,
        "day_score": day_score
    }
    
    updated_record = update_record(db, daily_record, data)
    
    # Award XP for day completion
    from app.services.xp_service import award_xp, DAY_PARTIAL, DAY_SUCCESS, DAY_PERFECT
    if day_status == "partial":
        award_xp(db, user_id, DAY_PARTIAL, "Partial day completion", "daily", updated_record.id)
    elif day_status == "success":
        award_xp(db, user_id, DAY_SUCCESS, "Successful day completion", "daily", updated_record.id)
    elif day_status == "perfect":
        award_xp(db, user_id, DAY_PERFECT, "Perfect day completion", "daily", updated_record.id)
    
    # Recalculate streak (only if we're recalculating today's date)
    if record_date == date.today():
        from app.services.streak_service import recalculate_streak
        recalculate_streak(db, user_id)
    
    return updated_record


def get_summary(db: Session, user_id: UUID, record_date: date) -> DailyRecord:
    # First recalculate to ensure it's up to date
    return recalculate_day(db, user_id, record_date)


def get_heatmap_data(db: Session, user_id: UUID, start_date: date, end_date: date) -> List[dict]:
    # Get all daily records in range
    records = get_range(db, user_id, start_date, end_date)
    
    # Recalculate each day to ensure data is fresh
    heatmap_data = []
    for record in records:
        updated_record = recalculate_day(db, user_id, record.date)
        heatmap_data.append({
            "date": updated_record.date,
            "completion_percentage": updated_record.completion_percentage,
            "day_status": updated_record.day_status
        })
    
    return heatmap_data
