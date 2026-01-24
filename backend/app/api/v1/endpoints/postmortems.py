"""Postmortem API endpoints."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.postmortem import (
    PostmortemCreate,
    PostmortemUpdate,
    PostmortemResponse,
    PostmortemListResponse,
    CreatePostmortemResponse,
)
from app.services.postmortem_service import PostmortemService
from app.tasks.generation_tasks import generate_postmortem_task

router = APIRouter()


def postmortem_to_response(postmortem) -> dict:
    """Convert a Postmortem model to response dict."""
    return {
        "id": str(postmortem.id),
        "title": postmortem.title,
        "severity": postmortem.severity,
        "incidentDate": postmortem.incident_date.isoformat(),
        "status": postmortem.status,
        "duration": str(postmortem.duration) if postmortem.duration else None,
        "slackThread": postmortem.slack_thread,
        "logs": postmortem.logs,
        "notes": postmortem.notes,
        "summary": postmortem.summary,
        "impact": postmortem.impact,
        "rootCause": postmortem.root_cause,
        "whys": [
            {"id": str(i), "why": w.get("question", ""), "answer": w.get("answer", "")}
            for i, w in enumerate(postmortem.five_whys or [])
        ],
        "wentWell": postmortem.lessons_learned or [],
        "wentPoorly": [],
        "timeline": [
            {
                "id": str(te.id),
                "timestamp": te.timestamp.isoformat(),
                "description": te.event,
                "eventType": "event",
                "source": te.actor,
            }
            for te in postmortem.timeline_events
        ] if postmortem.timeline_events else [],
        "actionItems": [
            {
                "id": str(ai.id),
                "description": ai.description,
                "owner": ai.owner or "",
                "dueDate": ai.due_date.isoformat() if ai.due_date else "",
                "priority": ai.priority,
                "status": ai.status,
            }
            for ai in postmortem.action_items
        ] if postmortem.action_items else [],
        "generationTaskId": postmortem.generation_task_id,
        "createdAt": postmortem.created_at.isoformat(),
        "updatedAt": postmortem.updated_at.isoformat(),
    }


@router.get("", response_model=PostmortemListResponse)
async def list_postmortems(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    severity: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List postmortems with pagination and filtering."""
    service = PostmortemService(db)
    postmortems, total = await service.list(
        page=page,
        limit=limit,
        severity=severity,
        status=status,
        search=search,
    )

    pages = (total + limit - 1) // limit if total > 0 else 0

    return PostmortemListResponse(
        items=[postmortem_to_response(p) for p in postmortems],
        total=total,
        page=page,
        pages=pages,
    )


@router.post("", response_model=CreatePostmortemResponse)
async def create_postmortem(
    data: PostmortemCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new postmortem and start generation."""
    service = PostmortemService(db)

    postmortem = await service.create(
        title=data.title,
        severity=data.severity.value,
        incident_date=data.incident_date,
        slack_thread=data.slack_thread,
        logs=data.logs,
        notes=data.notes,
    )

    # Start Celery task for generation
    task = generate_postmortem_task.delay(
        str(postmortem.id),
        {
            "title": data.title,
            "severity": data.severity.value,
            "incident_date": data.incident_date,
            "slack_thread": data.slack_thread,
            "logs": data.logs,
            "notes": data.notes,
        },
    )

    # Update postmortem with task ID
    await service.update(postmortem.id, generation_task_id=task.id, status="generating")

    return CreatePostmortemResponse(
        task_id=task.id,
        postmortem_id=str(postmortem.id),
    )


@router.get("/{postmortem_id}", response_model=PostmortemResponse)
async def get_postmortem(
    postmortem_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single postmortem by ID."""
    try:
        uuid_id = UUID(postmortem_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid postmortem ID")

    service = PostmortemService(db)
    postmortem = await service.get(uuid_id)

    if not postmortem:
        raise HTTPException(status_code=404, detail="Postmortem not found")

    return postmortem_to_response(postmortem)


@router.put("/{postmortem_id}", response_model=PostmortemResponse)
async def update_postmortem(
    postmortem_id: str,
    data: PostmortemUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a postmortem."""
    try:
        uuid_id = UUID(postmortem_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid postmortem ID")

    service = PostmortemService(db)
    update_data = data.model_dump(exclude_unset=True, by_alias=False)

    postmortem = await service.update(uuid_id, **update_data)

    if not postmortem:
        raise HTTPException(status_code=404, detail="Postmortem not found")

    return postmortem_to_response(postmortem)


@router.delete("/{postmortem_id}")
async def delete_postmortem(
    postmortem_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a postmortem (soft delete)."""
    try:
        uuid_id = UUID(postmortem_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid postmortem ID")

    service = PostmortemService(db)
    deleted = await service.delete(uuid_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Postmortem not found")

    return {"message": "Postmortem deleted"}


@router.post("/{postmortem_id}/sections/{section}/regenerate")
async def regenerate_section(
    postmortem_id: str,
    section: str,
    db: AsyncSession = Depends(get_db),
):
    """Regenerate a specific section of a postmortem."""
    valid_sections = [
        "summary", "timeline", "impact", "rootCause",
        "whys", "wentWell", "wentPoorly", "actionItems"
    ]

    if section not in valid_sections:
        raise HTTPException(status_code=400, detail=f"Invalid section: {section}")

    try:
        uuid_id = UUID(postmortem_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid postmortem ID")

    service = PostmortemService(db)
    postmortem = await service.get(uuid_id)

    if not postmortem:
        raise HTTPException(status_code=404, detail="Postmortem not found")

    # Start Celery task for section regeneration
    from app.tasks.generation_tasks import regenerate_section_task
    task = regenerate_section_task.delay(str(postmortem.id), section)

    return {"task_id": task.id}
