from fastapi import APIRouter, HTTPException

from app.schemas.generation import GenerationStatusResponse

router = APIRouter()


@router.get("/{task_id}/status", response_model=GenerationStatusResponse)
async def get_generation_status(task_id: str):
    """
    Get the status of a generation task.

    TODO:
    - Look up Celery task status
    - Return progress information
    """
    # Placeholder response
    return GenerationStatusResponse(
        status="pending",
        progress=0,
        current_step=None,
        error=None,
    )
