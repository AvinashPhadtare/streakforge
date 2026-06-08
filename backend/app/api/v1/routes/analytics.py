from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.db.session import get_db
from app.models.user import User
from app.schemas.analytics import DashboardStats, WeekdayStats, WeeklyReport, MonthlyReport, CategoryStats
from app.services.auth_service import get_current_user
from app.services.analytics_service import (
    get_dashboard_stats,
    get_weekday_stats,
    get_weekly_report,
    get_monthly_report,
    get_category_stats,
    get_heatmap_data as get_heatmap_data_analytics
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_dashboard_stats(db, current_user.id)


@router.get("/heatmap", response_model=list[dict])
def get_heatmap(
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_heatmap_data_analytics(db, current_user.id, start_date, end_date)


@router.get("/weekdays", response_model=list[WeekdayStats])
def get_weekday_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_weekday_stats(db, current_user.id)


@router.get("/weekly", response_model=WeeklyReport)
def get_weekly_stats(
    week_start: date = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_weekly_report(db, current_user.id, week_start)


@router.get("/monthly", response_model=MonthlyReport)
def get_monthly_stats(
    month: int = Query(None),
    year: int = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_monthly_report(db, current_user.id, month, year)


@router.get("/categories", response_model=list[CategoryStats])
def get_category_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_category_stats(db, current_user.id)
