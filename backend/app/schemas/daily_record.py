from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from uuid import UUID


class DailyRecordResponse(BaseModel):
    id: UUID
    user_id: UUID
    date: date
    tasks_total: int
    tasks_completed: int
    habits_total: int
    habits_completed: int
    completion_percentage: float
    xp_earned: int
    day_score: float
    day_status: str
    streak_counted: bool
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {
        "from_attributes": True
    }


class DailySummaryResponse(BaseModel):
    date: date
    tasks_total: int
    tasks_completed: int
    habits_total: int
    habits_completed: int
    completion_percentage: float
    day_status: str
    xp_earned: int
    day_score: float

    model_config = {
        "from_attributes": True
    }


class HeatmapDataPoint(BaseModel):
    date: date
    completion_percentage: float
    day_status: str

    model_config = {
        "from_attributes": True
    }
