from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.models.xp_transaction import XPTransaction
from app.models.user import User
from uuid import UUID


def create_transaction(db: Session, user_id: UUID, amount: int, reason: str, source_type: str, source_id: Optional[UUID] = None) -> XPTransaction:
    transaction = XPTransaction(
        user_id=user_id,
        amount=amount,
        reason=reason,
        source_type=source_type,
        source_id=source_id
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    user = db.execute(select(User).where(User.id == user_id)).scalar_one()
    user.xp += amount
    db.commit()
    db.refresh(user)

    return transaction


def get_recent(db: Session, user_id: UUID, limit: int = 10) -> List[XPTransaction]:
    return db.execute(
        select(XPTransaction)
        .where(XPTransaction.user_id == user_id)
        .order_by(desc(XPTransaction.created_at))
        .limit(limit)
    ).scalars().all()
