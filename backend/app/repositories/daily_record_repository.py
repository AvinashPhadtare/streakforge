from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from datetime import date
from app.models.daily_record import DailyRecord
from uuid import UUID


def get_by_date(db: Session, user_id: UUID, record_date: date) -> Optional[DailyRecord]:
    return db.execute(
        select(DailyRecord).where(
            and_(DailyRecord.user_id == user_id, DailyRecord.date == record_date)
        )
    ).scalar_one_or_none()


def get_or_create(db: Session, user_id: UUID, record_date: date) -> DailyRecord:
    record = get_by_date(db, user_id, record_date)
    if not record:
        record = DailyRecord(
            user_id=user_id,
            date=record_date
        )
        db.add(record)
        db.commit()
        db.refresh(record)
    return record


def update_record(db: Session, record: DailyRecord, data: dict) -> DailyRecord:
    for key, value in data.items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return record


def get_range(db: Session, user_id: UUID, start_date: date, end_date: date) -> List[DailyRecord]:
    return db.execute(
        select(DailyRecord).where(
            and_(
                DailyRecord.user_id == user_id,
                DailyRecord.date >= start_date,
                DailyRecord.date <= end_date
            )
        ).order_by(DailyRecord.date)
    ).scalars().all()
