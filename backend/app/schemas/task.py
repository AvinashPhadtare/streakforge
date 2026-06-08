from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from uuid import UUID


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    category: Optional[str] = None
    status: Optional[str] = "pending"
    due_date: Optional[date] = None
    estimated_minutes: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[date] = None
    estimated_minutes: Optional[int] = None
    actual_minutes: Optional[int] = None


class TaskResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    priority: str
    category: Optional[str]
    status: str
    due_date: Optional[date]
    estimated_minutes: Optional[int]
    actual_minutes: Optional[int]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {
        "from_attributes": True
    }