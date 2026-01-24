"""Postmortem SQLAlchemy model."""

from datetime import datetime, date
from typing import List, Optional
import uuid

from sqlalchemy import String, Text, Date, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Postmortem(Base):
    """Postmortem database model."""

    __tablename__ = "postmortems"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(10), nullable=False)  # SEV1-SEV4
    incident_date: Mapped[date] = mapped_column(Date, nullable=False)
    duration: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # minutes
    status: Mapped[str] = mapped_column(
        String(20), default="draft"
    )  # draft, generating, completed, failed

    # Input fields
    slack_thread: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    logs: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Generated content
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    impact: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    root_cause: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    five_whys: Mapped[Optional[List[dict]]] = mapped_column(JSONB, default=list)
    lessons_learned: Mapped[Optional[List[str]]] = mapped_column(JSONB, default=list)

    # Celery task tracking
    generation_task_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    timeline_events: Mapped[List["TimelineEvent"]] = relationship(
        "TimelineEvent", back_populates="postmortem", cascade="all, delete-orphan"
    )
    action_items: Mapped[List["ActionItem"]] = relationship(
        "ActionItem", back_populates="postmortem", cascade="all, delete-orphan"
    )


class TimelineEvent(Base):
    """Timeline event model."""

    __tablename__ = "timeline_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    postmortem_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("postmortems.id", ondelete="CASCADE"), nullable=False
    )
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    event: Mapped[str] = mapped_column(Text, nullable=False)
    actor: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)

    # Relationship
    postmortem: Mapped["Postmortem"] = relationship("Postmortem", back_populates="timeline_events")


class ActionItem(Base):
    """Action item model."""

    __tablename__ = "action_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    postmortem_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("postmortems.id", ondelete="CASCADE"), nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    owner: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="medium")  # high, medium, low
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, in_progress, completed
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Relationship
    postmortem: Mapped["Postmortem"] = relationship("Postmortem", back_populates="action_items")
