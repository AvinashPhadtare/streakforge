from typing import List
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.db.session import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.repositories import get_all_tasks_repo, get_task_by_id_repo, create_task_repo, update_task_repo, delete_task_repo
from app.services.auth_service import get_current_user
from app.services.daily_record_service import recalculate_day
from uuid import UUID


def get_all_tasks(db: Session, user_id: UUID) -> List[Task]:
    return get_all_tasks_repo(db, user_id)


def get_task(db: Session, task_id: UUID, user_id: UUID) -> Task:
    task = get_task_by_id_repo(db, task_id, user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


def create_task(db: Session, user_id: UUID, task_data: TaskCreate) -> Task:
    return create_task_repo(db, user_id, task_data)


def update_task(db: Session, task_id: UUID, user_id: UUID, task_data: TaskUpdate) -> Task:
    task = update_task_repo(db, task_id, user_id, task_data)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


def delete_task(db: Session, task_id: UUID, user_id: UUID) -> None:
    success = delete_task_repo(db, task_id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )


def complete_task(db: Session, task_id: UUID, user_id: UUID) -> Task:
    task = get_task_by_id_repo(db, task_id, user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    if task.status == "completed":
        return task
    task.status = "completed"
    task.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    
    from app.services.xp_service import award_xp, TASK_COMPLETED, TASK_HIGH_PRIORITY
    xp_amount = TASK_HIGH_PRIORITY if task.priority == "high" else TASK_COMPLETED
    award_xp(db, user_id, xp_amount, "Task completed", "task", task_id)
    
    # Recalculate daily record if task has a due date
    if task.due_date:
        recalculate_day(db, user_id, task.due_date)
    
    return task