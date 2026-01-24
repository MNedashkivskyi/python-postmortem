"""Celery tasks for postmortem generation."""

import time
from typing import Optional

from app.core.celery_app import celery
from app.core.config import settings


@celery.task(bind=True, name="generate_postmortem")
def generate_postmortem_task(self, postmortem_id: str, input_data: dict):
    """
    Generate a complete postmortem from input data.

    In production, this would call the Anthropic Claude API.
    For now, it simulates the generation process.
    """
    steps = [
        ("Parsing Slack thread...", 10),
        ("Processing system logs...", 25),
        ("Extracting timeline...", 40),
        ("Analyzing root cause...", 55),
        ("Performing 5 Whys analysis...", 70),
        ("Assessing impact...", 80),
        ("Generating action items...", 90),
        ("Finalizing postmortem...", 100),
    ]

    for step_name, progress in steps:
        self.update_state(
            state="PROGRESS",
            meta={
                "current_step": step_name,
                "progress": progress,
            },
        )
        # Simulate processing time
        time.sleep(1)

    # In production, this would be the actual generated content
    # For now, return mock generated data
    generated_content = {
        "summary": f"Incident involving {input_data.get('title', 'unknown issue')}. "
                   "The incident was detected through monitoring alerts and resolved "
                   "after investigation and mitigation steps were taken.",
        "impact": "Users experienced degraded service during the incident window. "
                  "Approximately 1000 users were affected.",
        "root_cause": "The root cause was identified as a configuration issue "
                      "that caused unexpected behavior under load.",
        "five_whys": [
            {"question": "Why did the incident occur?", "answer": "A configuration error was deployed."},
            {"question": "Why was this configuration deployed?", "answer": "The change was not properly reviewed."},
            {"question": "Why wasn't it reviewed?", "answer": "The review process was bypassed due to urgency."},
        ],
        "lessons_learned": [
            "All configuration changes should go through the standard review process",
            "Add monitoring for this specific failure mode",
            "Document the incident response process",
        ],
        "duration": 45,
    }

    # Update the postmortem in the database
    # This is done synchronously since Celery tasks can't use async
    _update_postmortem_sync(postmortem_id, generated_content)

    return {"status": "completed", "postmortem_id": postmortem_id}


@celery.task(bind=True, name="regenerate_section")
def regenerate_section_task(self, postmortem_id: str, section: str):
    """Regenerate a specific section of a postmortem."""
    self.update_state(
        state="PROGRESS",
        meta={
            "current_step": f"Regenerating {section}...",
            "progress": 50,
        },
    )

    time.sleep(2)

    # In production, this would regenerate just the specific section
    return {"status": "completed", "section": section, "postmortem_id": postmortem_id}


def _update_postmortem_sync(postmortem_id: str, content: dict):
    """
    Synchronously update postmortem in database.

    This uses a synchronous database connection since Celery tasks
    don't support async/await natively.
    """
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from uuid import UUID

    from app.models import Postmortem

    # Create sync engine
    sync_url = settings.DATABASE_URL  # Already synchronous URL
    engine = create_engine(sync_url)
    Session = sessionmaker(bind=engine)

    with Session() as session:
        postmortem = session.query(Postmortem).filter(
            Postmortem.id == UUID(postmortem_id)
        ).first()

        if postmortem:
            postmortem.summary = content.get("summary")
            postmortem.impact = content.get("impact")
            postmortem.root_cause = content.get("root_cause")
            postmortem.five_whys = content.get("five_whys", [])
            postmortem.lessons_learned = content.get("lessons_learned", [])
            postmortem.duration = content.get("duration")
            postmortem.status = "completed"
            session.commit()
