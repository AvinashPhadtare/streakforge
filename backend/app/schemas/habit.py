from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List, Any
from uuid import UUID


class HabitCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    frequency: Optional[str] = "daily"
    target_days: Optional[List[int]] = None


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    frequency: Optional[str] = None
    target_days: Optional[List[int]] = None
    is_active: Optional[bool] = None


class HabitLogResponse(BaseModel):
    id: UUID
    habit_id: UUID
    user_id: UUID
    date: date
    completed_at: datetime
    notes: Optional[str]

    model_config = {
        "from_attributes": True
    }


class HabitResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    category: Optional[str]
    frequency: str
    target_days: Optional[List[int]]
    is_active: bool
    current_streak: int
    longest_streak: int
    total_completions: int
    created_at: datetime
    updated_at: Optional[datetime]
    today_completed: bool

    model_config = {
        "from_attributes": True
    }
