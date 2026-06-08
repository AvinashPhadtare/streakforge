from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.db.base import Base


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    habit_id = Column(UUID(as_uuid=True), ForeignKey("habits.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String, nullable=True)

    habit = relationship("Habit", back_populates="habit_logs")
    user = relationship("User", back_populates="habit_logs")

    __table_args__ = (UniqueConstraint("habit_id", "date", name="uq_habit_date"),)
