from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import date
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from uuid import UUID


def get_all_tasks_repo(db: Session, user_id: UUID) -> List[Task]:
    return db.execute(select(Task).where(Task.user_id == user_id)).scalars().all()


def get_task_by_id_repo(db: Session, task_id: UUID, user_id: UUID) -> Optional[Task]:
    return db.execute(select(Task).where(Task.id == task_id, Task.user_id == user_id)).scalar_one_or_none()


def create_task_repo(db: Session, user_id: UUID, task_data: TaskCreate) -> Task:
    db_task = Task(
        user_id=user_id,
        **task_data.model_dump(exclude_unset=True)
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task_repo(db: Session, task_id: UUID, user_id: UUID, task_data: TaskUpdate) -> Optional[Task]:
    task = get_task_by_id_repo(db, task_id, user_id)
    if not task:
        return None
    for key, value in task_data.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


def delete_task_repo(db: Session, task_id: UUID, user_id: UUID) -> bool:
    task = get_task_by_id_repo(db, task_id, user_id)
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True


def get_tasks_by_date_repo(db: Session, user_id: UUID, target_date: date) -> List[Task]:
    return db.execute(select(Task).where(Task.user_id == user_id, Task.due_date == target_date)).scalars().all()