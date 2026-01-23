from typing import Optional
from enum import Enum

from pydantic import BaseModel, Field


class GenerationStatusType(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class GenerationStatusResponse(BaseModel):
    status: GenerationStatusType
    progress: int = Field(ge=0, le=100)
    current_step: Optional[str] = Field(None, alias="currentStep")
    error: Optional[str] = None

    class Config:
        populate_by_name = True
