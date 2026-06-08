from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.auth_service import get_current_user
from app.services.task_service import (
    get_all_tasks,
    get_task,
    create_task,
    update_task,
    delete_task,
    complete_task
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskResponse])
def get_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_all_tasks(db, current_user.id)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_new_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_task(db, current_user.id, task_data)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task_by_id_endpoint(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_task(db, task_id, current_user.id)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_existing_task(
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_task(db, task_id, current_user.id, task_data)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    delete_task(db, task_id, current_user.id)


@router.post("/{task_id}/complete", response_model=TaskResponse)
def mark_task_complete(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return complete_task(db, task_id, current_user.id)