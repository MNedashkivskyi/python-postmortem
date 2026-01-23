from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query

from app.schemas.postmortem import (
    PostmortemCreate,
    PostmortemUpdate,
    PostmortemResponse,
    PostmortemListResponse,
    CreatePostmortemResponse,
)

router = APIRouter()


@router.get("", response_model=PostmortemListResponse)
async def list_postmortems(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    severity: Optional[str] = None,
    search: Optional[str] = None,
):
    """
    List postmortems with pagination and filtering.

    TODO: Implement database query with filters.
    """
    # Placeholder response
    return PostmortemListResponse(
        items=[],
        total=0,
        page=page,
        pages=0,
    )


@router.post("", response_model=CreatePostmortemResponse)
async def create_postmortem(data: PostmortemCreate):
    """
    Create a new postmortem and start generation.

    TODO:
    - Save to database
    - Start Celery task for generation
    """
    task_id = str(uuid4())
    postmortem_id = str(uuid4())

    # Placeholder: Start generation task
    # generate_postmortem.delay(postmortem_id, data.dict())

    return CreatePostmortemResponse(
        task_id=task_id,
        postmortem_id=postmortem_id,
    )


@router.get("/{postmortem_id}", response_model=PostmortemResponse)
async def get_postmortem(postmortem_id: str):
    """
    Get a single postmortem by ID.

    TODO: Implement database lookup.
    """
    raise HTTPException(status_code=404, detail="Postmortem not found")


@router.put("/{postmortem_id}", response_model=PostmortemResponse)
async def update_postmortem(postmortem_id: str, data: PostmortemUpdate):
    """
    Update a postmortem.

    TODO: Implement database update.
    """
    raise HTTPException(status_code=404, detail="Postmortem not found")


@router.delete("/{postmortem_id}")
async def delete_postmortem(postmortem_id: str):
    """
    Delete a postmortem.

    TODO: Implement soft delete.
    """
    raise HTTPException(status_code=404, detail="Postmortem not found")


@router.post("/{postmortem_id}/sections/{section}/regenerate")
async def regenerate_section(postmortem_id: str, section: str):
    """
    Regenerate a specific section of a postmortem.

    TODO: Start Celery task for section regeneration.
    """
    valid_sections = [
        "summary", "timeline", "impact", "rootCause",
        "whys", "wentWell", "wentPoorly", "actionItems"
    ]

    if section not in valid_sections:
        raise HTTPException(status_code=400, detail=f"Invalid section: {section}")

    task_id = str(uuid4())

    return {"task_id": task_id}
