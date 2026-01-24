"""Postmortem service for CRUD operations."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Postmortem, TimelineEvent, ActionItem


class PostmortemService:
    """Service for postmortem CRUD operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        title: str,
        severity: str,
        incident_date: str,
        slack_thread: Optional[str] = None,
        logs: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> Postmortem:
        """Create a new postmortem."""
        postmortem = Postmortem(
            title=title,
            severity=severity,
            incident_date=datetime.strptime(incident_date, "%Y-%m-%d").date(),
            slack_thread=slack_thread,
            logs=logs,
            notes=notes,
            status="draft",
        )
        self.db.add(postmortem)
        await self.db.flush()
        await self.db.refresh(postmortem)
        return postmortem

    async def get(self, postmortem_id: UUID) -> Optional[Postmortem]:
        """Get a postmortem by ID with relationships."""
        result = await self.db.execute(
            select(Postmortem)
            .options(
                selectinload(Postmortem.timeline_events),
                selectinload(Postmortem.action_items),
            )
            .where(Postmortem.id == postmortem_id)
            .where(Postmortem.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        page: int = 1,
        limit: int = 10,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> tuple[List[Postmortem], int]:
        """List postmortems with pagination and filtering."""
        query = select(Postmortem).where(Postmortem.deleted_at.is_(None))

        # Apply filters
        if severity:
            query = query.where(Postmortem.severity == severity)
        if status:
            query = query.where(Postmortem.status == status)
        if search:
            query = query.where(
                or_(
                    Postmortem.title.ilike(f"%{search}%"),
                    Postmortem.summary.ilike(f"%{search}%"),
                )
            )

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination and eager load relationships
        query = query.options(
            selectinload(Postmortem.timeline_events),
            selectinload(Postmortem.action_items),
        )
        query = query.order_by(Postmortem.created_at.desc())
        query = query.offset((page - 1) * limit).limit(limit)

        result = await self.db.execute(query)
        postmortems = list(result.scalars().all())

        return postmortems, total

    async def update(self, postmortem_id: UUID, **kwargs) -> Optional[Postmortem]:
        """Update a postmortem."""
        postmortem = await self.get(postmortem_id)
        if not postmortem:
            return None

        for key, value in kwargs.items():
            if hasattr(postmortem, key) and value is not None:
                setattr(postmortem, key, value)

        postmortem.updated_at = datetime.utcnow()
        await self.db.flush()
        await self.db.refresh(postmortem)
        return postmortem

    async def update_status(self, postmortem_id: UUID, status: str) -> Optional[Postmortem]:
        """Update postmortem status."""
        return await self.update(postmortem_id, status=status)

    async def update_generated_content(
        self,
        postmortem_id: UUID,
        summary: Optional[str] = None,
        impact: Optional[str] = None,
        root_cause: Optional[str] = None,
        five_whys: Optional[List[dict]] = None,
        lessons_learned: Optional[List[str]] = None,
        duration: Optional[int] = None,
    ) -> Optional[Postmortem]:
        """Update the generated content of a postmortem."""
        return await self.update(
            postmortem_id,
            summary=summary,
            impact=impact,
            root_cause=root_cause,
            five_whys=five_whys,
            lessons_learned=lessons_learned,
            duration=duration,
            status="completed",
        )

    async def add_timeline_event(
        self,
        postmortem_id: UUID,
        timestamp: datetime,
        event: str,
        actor: Optional[str] = None,
        order: int = 0,
    ) -> TimelineEvent:
        """Add a timeline event to a postmortem."""
        timeline_event = TimelineEvent(
            postmortem_id=postmortem_id,
            timestamp=timestamp,
            event=event,
            actor=actor,
            order=order,
        )
        self.db.add(timeline_event)
        await self.db.flush()
        return timeline_event

    async def add_action_item(
        self,
        postmortem_id: UUID,
        description: str,
        owner: Optional[str] = None,
        priority: str = "medium",
        status: str = "pending",
        due_date: Optional[str] = None,
    ) -> ActionItem:
        """Add an action item to a postmortem."""
        action_item = ActionItem(
            postmortem_id=postmortem_id,
            description=description,
            owner=owner,
            priority=priority,
            status=status,
            due_date=datetime.strptime(due_date, "%Y-%m-%d").date() if due_date else None,
        )
        self.db.add(action_item)
        await self.db.flush()
        return action_item

    async def delete(self, postmortem_id: UUID) -> bool:
        """Soft delete a postmortem."""
        postmortem = await self.get(postmortem_id)
        if not postmortem:
            return False

        postmortem.deleted_at = datetime.utcnow()
        await self.db.flush()
        return True
