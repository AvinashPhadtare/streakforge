from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from uuid import UUID


class XPTransactionResponse(BaseModel):
    id: UUID
    user_id: UUID
    amount: int
    reason: str
    source_type: str
    source_id: Optional[UUID]
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class LevelResponse(BaseModel):
    xp: int
    level: int
    xp_for_next_level: Optional[int]
    xp_progress_percentage: float
    recent_transactions: List[XPTransactionResponse]

    model_config = {
        "from_attributes": True
    }
