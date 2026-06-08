from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.db.base import Base


class DailyRecord(Base):
    __tablename__ = "daily_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    tasks_total = Column(Integer, default=0, nullable=False)
    tasks_completed = Column(Integer, default=0, nullable=False)
    habits_total = Column(Integer, default=0, nullable=False)
    habits_completed = Column(Integer, default=0, nullable=False)
    completion_percentage = Column(Float, default=0.0, nullable=False)
    xp_earned = Column(Integer, default=0, nullable=False)
    day_score = Column(Float, default=0.0, nullable=False)
    day_status = Column(String, default="missed", nullable=False)  # missed/partial/success/perfect
    streak_counted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="daily_records")

    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_user_date"),)
