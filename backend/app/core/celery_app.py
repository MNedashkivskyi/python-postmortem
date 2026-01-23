from celery import Celery

from app.core.config import settings

celery = Celery(
    "postmortem_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
)

# Auto-discover tasks
celery.autodiscover_tasks(["app.tasks"])
