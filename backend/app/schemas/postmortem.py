from datetime import datetime, date
from typing import Optional
from enum import Enum

from pydantic import BaseModel, Field


class Severity(str, Enum):
    SEV1 = "SEV1"
    SEV2 = "SEV2"
    SEV3 = "SEV3"
    SEV4 = "SEV4"


class PostmortemStatus(str, Enum):
    DRAFT = "draft"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class EventType(str, Enum):
    DETECTION = "detection"
    RESPONSE = "response"
    MITIGATION = "mitigation"
    RESOLUTION = "resolution"
    EVENT = "event"


class ActionItemPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ActionItemStatus(str, Enum):
    OPEN = "open"
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TimelineEvent(BaseModel):
    id: str
    timestamp: datetime
    description: str
    event_type: EventType = Field(alias="eventType")
    source: Optional[str] = None

    class Config:
        populate_by_name = True


class WhyItem(BaseModel):
    id: str
    why: str
    answer: str


class ActionItem(BaseModel):
    id: str
    description: str
    owner: str
    due_date: str = Field(alias="dueDate")
    priority: ActionItemPriority
    status: ActionItemStatus

    class Config:
        populate_by_name = True


class PostmortemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    severity: Severity
    incident_date: str = Field(alias="incidentDate")
    slack_thread: str = Field(alias="slackThread")
    logs: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        populate_by_name = True


class PostmortemUpdate(BaseModel):
    title: Optional[str] = None
    severity: Optional[Severity] = None
    incident_date: Optional[str] = Field(None, alias="incidentDate")
    summary: Optional[str] = None
    impact: Optional[str] = None
    root_cause: Optional[str] = Field(None, alias="rootCause")
    whys: Optional[list[WhyItem]] = None
    went_well: Optional[list[str]] = Field(None, alias="wentWell")
    went_poorly: Optional[list[str]] = Field(None, alias="wentPoorly")
    timeline: Optional[list[TimelineEvent]] = None
    action_items: Optional[list[ActionItem]] = Field(None, alias="actionItems")

    class Config:
        populate_by_name = True


class PostmortemResponse(BaseModel):
    id: str
    title: str
    severity: Severity
    incident_date: str = Field(alias="incidentDate")
    status: PostmortemStatus
    duration: Optional[str] = None

    # Input fields
    slack_thread: Optional[str] = Field(None, alias="slackThread")
    logs: Optional[str] = None
    notes: Optional[str] = None

    # Generated content
    summary: Optional[str] = None
    timeline: Optional[list[TimelineEvent]] = None
    impact: Optional[str] = None
    root_cause: Optional[str] = Field(None, alias="rootCause")
    whys: Optional[list[WhyItem]] = None
    went_well: Optional[list[str]] = Field(None, alias="wentWell")
    went_poorly: Optional[list[str]] = Field(None, alias="wentPoorly")
    action_items: Optional[list[ActionItem]] = Field(None, alias="actionItems")

    # Metadata
    generation_task_id: Optional[str] = Field(None, alias="generationTaskId")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    class Config:
        populate_by_name = True


class PostmortemListResponse(BaseModel):
    items: list[PostmortemResponse]
    total: int
    page: int
    pages: int


class CreatePostmortemResponse(BaseModel):
    task_id: str = Field(alias="taskId")
    postmortem_id: str = Field(alias="postmortemId")

    class Config:
        populate_by_name = True
