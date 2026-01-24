"""Generation status API endpoints."""

from fastapi import APIRouter, HTTPException

from celery.result import AsyncResult

from app.core.celery_app import celery
from app.schemas.generation import GenerationStatusResponse

router = APIRouter()


@router.get("/{task_id}/status", response_model=GenerationStatusResponse)
async def get_generation_status(task_id: str):
    """
    Get the status of a generation task.

    Returns the current state, progress percentage, and current step.
    """
    try:
        task_result = AsyncResult(task_id, app=celery)

        if task_result.state == "PENDING":
            return GenerationStatusResponse(
                status="pending",
                progress=0,
                current_step="Waiting to start...",
                error=None,
            )
        elif task_result.state == "PROGRESS":
            info = task_result.info or {}
            return GenerationStatusResponse(
                status="generating",
                progress=info.get("progress", 0),
                current_step=info.get("current_step", "Processing..."),
                error=None,
            )
        elif task_result.state == "SUCCESS":
            return GenerationStatusResponse(
                status="completed",
                progress=100,
                current_step="Complete!",
                error=None,
            )
        elif task_result.state == "FAILURE":
            error_msg = str(task_result.info) if task_result.info else "Unknown error"
            return GenerationStatusResponse(
                status="failed",
                progress=0,
                current_step=None,
                error=error_msg,
            )
        else:
            return GenerationStatusResponse(
                status=task_result.state.lower(),
                progress=0,
                current_step=None,
                error=None,
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get task status: {str(e)}"
        )
