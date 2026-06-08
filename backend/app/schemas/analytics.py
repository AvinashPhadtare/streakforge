from pydantic import BaseModel
from datetime import datetime, date
from typing import List


class DashboardStats(BaseModel):
    current_streak: int
    longest_streak: int
    total_active_days: int
    total_tasks_completed: int
    total_habits_completed: int
    total_xp: int
    current_level: int
    active_days_this_month: int
    completion_rate_this_week: float
    completion_rate_this_month: float


class WeekdayStats(BaseModel):
    weekday: str
    avg_completion: float
    total_days: int
    active_days: int


class WeeklyReport(BaseModel):
    week_start: date
    week_end: date
    tasks_completed: int
    habits_completed: int
    avg_completion: float
    best_day: Optional[date]
    xp_earned: int
    active_days: int


class MonthlyReport(BaseModel):
    month: int
    year: int
    tasks_completed: int
    habits_completed: int
    avg_completion: float
    best_streak: int
    xp_earned: int
    active_days: int
    total_days: int


class CategoryStats(BaseModel):
    category: Optional[str]
    tasks_total: int
    tasks_completed: int
    completion_rate: float
