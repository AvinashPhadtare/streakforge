from pydantic import BaseModel
from datetime import date
from typing import Optional
from uuid import UUID


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_active_date: Optional[date]
    total_active_days: int

    model_config = {
        "from_attributes": True
    }
