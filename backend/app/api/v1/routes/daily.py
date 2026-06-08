from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.db.session import get_db
from app.models.user import User
from app.schemas.daily_record import DailySummaryResponse, HeatmapDataPoint
from app.services.auth_service import get_current_user
from app.services.daily_record_service import get_summary, get_heatmap_data

router = APIRouter(prefix="/daily", tags=["daily"])


@router.get("/today", response_model=DailySummaryResponse)
def get_today_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    daily_record = get_summary(db, current_user.id, today)
    return DailySummaryResponse.model_validate(daily_record)


@router.get("/{record_date}", response_model=DailySummaryResponse)
def get_date_summary(
    record_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    daily_record = get_summary(db, current_user.id, record_date)
    return DailySummaryResponse.model_validate(daily_record)


@router.get("/heatmap", response_model=List[HeatmapDataPoint])
def get_heatmap(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    heatmap_data = get_heatmap_data(db, current_user.id, start_date, end_date)
    return [HeatmapDataPoint(**item) for item in heatmap_data]
