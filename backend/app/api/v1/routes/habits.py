from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from datetime import date
from uuid import UUID
from typing import Optional
from app.db.session import get_db
from app.models.user import User
from app.schemas.habit import HabitCreate, HabitUpdate, HabitResponse, HabitLogResponse
from app.services.auth_service import get_current_user
from app.services.habit_service import get_habits, get_habit, create_habit, update_habit, delete_habit, log_habit

router = APIRouter(prefix="/habits", tags=["habits"])


@router.get("", response_model=list[HabitResponse])
def get_all_habits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    return get_habits(db, current_user.id, today.weekday())


@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
def create_new_habit(
    habit_data: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    habit = create_habit(
        db,
        current_user.id,
        habit_data.name,
        habit_data.description,
        habit_data.category,
        habit_data.frequency,
        habit_data.target_days
    )
    today = date.today()
    habit.today_completed = False
    return habit


@router.get("/{habit_id}", response_model=HabitResponse)
def get_single_habit(
    habit_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    return get_habit(db, habit_id, current_user.id, today.weekday())


@router.patch("/{habit_id}", response_model=HabitResponse)
def update_single_habit(
    habit_id: UUID,
    habit_data: HabitUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = habit_data.model_dump(exclude_unset=True)
    habit = update_habit(db, habit_id, current_user.id, data)
    today = date.today()
    habit.today_completed = False
    return habit


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_single_habit(
    habit_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    delete_habit(db, habit_id, current_user.id)


@router.post("/{habit_id}/log", response_model=HabitLogResponse, status_code=status.HTTP_201_CREATED)
def log_a_habit(
    habit_id: UUID,
    log_date: Optional[date] = None,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return log_habit(db, habit_id, current_user.id, log_date, notes)
