from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from datetime import date, timedelta, datetime
from app.models.streak import Streak
from app.models.daily_record import DailyRecord
from app.models.task import Task
from app.models.habit_log import HabitLog
from app.models.xp_transaction import XPTransaction
from uuid import UUID


def get_dashboard_stats(db: Session, user_id: UUID):
    today = date.today()
    first_day_of_month = date(today.year, today.month, 1)
    week_start = today - timedelta(days=today.weekday())

    streak = db.execute(select(Streak).where(Streak.user_id == user_id)).scalar_one_or_none()
    current_streak = streak.current_streak if streak else 0
    longest_streak = streak.longest_streak if streak else 0
    total_active_days = streak.total_active_days if streak else 0

    total_tasks_completed = db.execute(
        select(func.count(Task.id))
        .where(and_(Task.user_id == user_id, Task.status == "completed"))
    ).scalar()

    total_habits_completed = db.execute(
        select(func.count(HabitLog.id))
        .where(HabitLog.user_id == user_id)
    ).scalar()

    total_xp = db.execute(
        select(func.sum(XPTransaction.amount))
        .where(XPTransaction.user_id == user_id)
    ).scalar() or 0

    user = db.execute(select(Task.user).where(Task.user_id == user_id)).scalar_one_or_none()
    current_level = user.level if user else 1

    active_days_this_month = db.execute(
        select(func.count(DailyRecord.id))
        .where(
            and_(
                DailyRecord.user_id == user_id,
                DailyRecord.date >= first_day_of_month,
                DailyRecord.day_status != "missed"
            )
        )
    ).scalar()

    week_records = db.execute(
        select(DailyRecord)
        .where(
            and_(
                DailyRecord.user_id == user_id,
                DailyRecord.date >= week_start,
                DailyRecord.date <= today
            )
        )
    ).scalars().all()

    completion_rate_this_week = 0.0
    if week_records:
        avg_completion = sum(r.completion_percentage for r in week_records) / len(week_records)
        completion_rate_this_week = avg_completion

    month_records = db.execute(
        select(DailyRecord)
        .where(
            and_(
                DailyRecord.user_id == user_id,
                DailyRecord.date >= first_day_of_month,
                DailyRecord.date <= today
            )
        )
    ).scalars().all()

    completion_rate_this_month = 0.0
    if month_records:
        avg_completion = sum(r.completion_percentage for r in month_records) / len(month_records)
        completion_rate_this_month = avg_completion

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_active_days": total_active_days,
        "total_tasks_completed": total_tasks_completed or 0,
        "total_habits_completed": total_habits_completed or 0,
        "total_xp": total_xp,
        "current_level": current_level,
        "active_days_this_month": active_days_this_month or 0,
        "completion_rate_this_week": completion_rate_this_week,
        "completion_rate_this_month": completion_rate_this_month
    }


def get_weekday_stats(db: Session, user_id: UUID):
    weekday_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    results = []

    for weekday in range(7):
        records = db.execute(
            select(DailyRecord)
            .where(
                and_(
                    DailyRecord.user_id == user_id,
                    func.extract("isodow", DailyRecord.date) == weekday + 1
                )
            )
        ).scalars().all()

        total_days = len(records)
        active_days = sum(1 for r in records if r.day_status != "missed")
        avg_completion = sum(r.completion_percentage for r in records) / total_days if total_days > 0 else 0.0

        results.append({
            "weekday": weekday_names[weekday],
            "avg_completion": avg_completion,
            "total_days": total_days,
            "active_days": active_days
        })

    return results


def get_weekly_report(db: Session, user_id: UUID, week_start: Optional[date] = None):
    if not week_start:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())

    week_end = week_start + timedelta(days=6)

    records = db.execute(
        select(DailyRecord)
        .where(
            and_(
                DailyRecord.user_id == user_id,
                DailyRecord.date >= week_start,
                DailyRecord.date <= week_end
            )
        )
    ).scalars().all()

    tasks_completed = db.execute(
        select(func.count(Task.id))
        .where(
            and_(
                Task.user_id == user_id,
                Task.status == "completed",
                Task.completed_at >= week_start,
                Task.completed_at <= week_end
            )
        )
    ).scalar() or 0

    habits_completed = db.execute(
        select(func.count(HabitLog.id))
        .where(
            and_(
                HabitLog.user_id == user_id,
                HabitLog.date >= week_start,
                HabitLog.date <= week_end
            )
        )
    ).scalar() or 0

    xp_earned = db.execute(
        select(func.sum(XPTransaction.amount))
        .where(
            and_(
                XPTransaction.user_id == user_id,
                XPTransaction.created_at >= week_start,
                XPTransaction.created_at <= week_end
            )
        )
    ).scalar() or 0

    avg_completion = 0.0
    best_day = None
    best_completion = -1
    active_days = 0
    if records:
        avg_completion = sum(r.completion_percentage for r in records) / len(records)
        for r in records:
            if r.completion_percentage > best_completion:
                best_completion = r.completion_percentage
                best_day = r.date
            if r.day_status != "missed":
                active_days += 1

    return {
        "week_start": week_start,
        "week_end": week_end,
        "tasks_completed": tasks_completed,
        "habits_completed": habits_completed,
        "avg_completion": avg_completion,
        "best_day": best_day,
        "xp_earned": xp_earned,
        "active_days": active_days
    }


def get_monthly_report(db: Session, user_id: UUID, month: Optional[int] = None, year: Optional[int] = None):
    today = date.today()
    if not month:
        month = today.month
    if not year:
        year = today.year

    first_day = date(year, month, 1)
    last_day = date(year, month + 1, 1) - timedelta(days=1) if month < 12 else date(year, 12, 31)

    records = db.execute(
        select(DailyRecord)
        .where(
            and_(
                DailyRecord.user_id == user_id,
                DailyRecord.date >= first_day,
                DailyRecord.date <= last_day
            )
        )
    ).scalars().all()

    tasks_completed = db.execute(
        select(func.count(Task.id))
        .where(
            and_(
                Task.user_id == user_id,
                Task.status == "completed",
                Task.completed_at >= first_day,
                Task.completed_at <= last_day
            )
        )
    ).scalar() or 0

    habits_completed = db.execute(
        select(func.count(HabitLog.id))
        .where(
            and_(
                HabitLog.user_id == user_id,
                HabitLog.date >= first_day,
                HabitLog.date <= last_day
            )
        )
    ).scalar() or 0

    xp_earned = db.execute(
        select(func.sum(XPTransaction.amount))
        .where(
            and_(
                XPTransaction.user_id == user_id,
                XPTransaction.created_at >= first_day,
                XPTransaction.created_at <= last_day
            )
        )
    ).scalar() or 0

    avg_completion = 0.0
    best_streak = 0
    current_streak = 0
    active_days = 0
    total_days = (last_day - first_day).days + 1

    if records:
        avg_completion = sum(r.completion_percentage for r in records) / len(records)
        sorted_records = sorted(records, key=lambda r: r.date)

        for i, record in enumerate(sorted_records):
            if record.day_status != "missed":
                if i == 0 or (sorted_records[i-1].date + timedelta(days=1) == record.date):
                    current_streak += 1
                    if current_streak > best_streak:
                        best_streak = current_streak
                else:
                    current_streak = 1
                active_days += 1
            else:
                current_streak = 0

    return {
        "month": month,
        "year": year,
        "tasks_completed": tasks_completed,
        "habits_completed": habits_completed,
        "avg_completion": avg_completion,
        "best_streak": best_streak,
        "xp_earned": xp_earned,
        "active_days": active_days,
        "total_days": total_days
    }


def get_category_stats(db: Session, user_id: UUID):
    tasks = db.execute(select(Task).where(Task.user_id == user_id)).scalars().all()

    categories = {}
    for task in tasks:
        category = task.category or "Uncategorized"
        if category not in categories:
            categories[category] = {
                "category": category,
                "tasks_total": 0,
                "tasks_completed": 0,
                "completion_rate": 0.0
            }
        categories[category]["tasks_total"] += 1
        if task.status == "completed":
            categories[category]["tasks_completed"] += 1

    for cat in categories.values():
        if cat["tasks_total"] > 0:
            cat["completion_rate"] = (cat["tasks_completed"] / cat["tasks_total"]) * 100

    return list(categories.values())


def get_heatmap_data(db: Session, user_id: UUID, start_date: date, end_date: date):
    records = db.execute(
        select(DailyRecord)
        .where(
            and_(
                DailyRecord.user_id == user_id,
                DailyRecord.date >= start_date,
                DailyRecord.date <= end_date
            )
        )
    ).scalars().all()

    return [
        {
            "date": record.date,
            "completion_percentage": record.completion_percentage,
            "day_status": record.day_status
        }
        for record in records
    ]
