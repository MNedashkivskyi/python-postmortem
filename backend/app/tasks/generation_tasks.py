"""Celery tasks for postmortem generation using Claude API."""

import logging
from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.celery_app import celery
from app.core.config import settings
from app.models import Postmortem, TimelineEvent, ActionItem

logger = logging.getLogger(__name__)


def get_sync_session():
    """Create a synchronous database session for Celery tasks."""
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    return Session()


@celery.task(bind=True, name="generate_postmortem")
def generate_postmortem_task(self, postmortem_id: str, input_data: dict):
    """
    Generate a complete postmortem from input data using Claude API.

    Steps:
    1. Generate executive summary
    2. Generate impact assessment
    3. Extract timeline from communications/logs
    4. Analyze root cause
    5. Perform 5 Whys analysis
    6. Generate lessons learned
    7. Generate action items
    8. Update postmortem in database
    """
    from app.services.ai_service import ai_service

    title = input_data.get("title", "Unknown Incident")
    severity = input_data.get("severity", "SEV3")
    slack_thread = input_data.get("slack_thread")
    logs = input_data.get("logs")
    notes = input_data.get("notes")

    generated_content = {}
    timeline_events = []
    action_items = []

    try:
        # Step 1: Generate summary
        self.update_state(
            state="PROGRESS",
            meta={"current_step": "Generating executive summary...", "progress": 10},
        )
        generated_content["summary"] = ai_service.generate_summary(
            title, severity, slack_thread, logs, notes
        )

        # Step 2: Generate impact
        self.update_state(
            state="PROGRESS",
            meta={"current_step": "Assessing impact...", "progress": 25},
        )
        generated_content["impact"] = ai_service.generate_impact(
            title, severity, slack_thread, logs
        )

        # Step 3: Extract timeline
        self.update_state(
            state="PROGRESS",
            meta={"current_step": "Extracting timeline...", "progress": 40},
        )
        timeline_data = ai_service.generate_timeline(slack_thread, logs)
        generated_content["duration"] = ai_service.estimate_duration(timeline_data)

        # Convert timeline to TimelineEvent format
        for i, event in enumerate(timeline_data):
            try:
                timestamp_str = event.get("timestamp", "")
                if timestamp_str:
                    timestamp = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
                else:
                    timestamp = datetime.utcnow()

                timeline_events.append({
                    "timestamp": timestamp,
                    "event": event.get("event", ""),
                    "actor": event.get("actor", ""),
                    "order": i,
                })
            except (ValueError, KeyError) as e:
                logger.warning(f"Failed to parse timeline event: {e}")

        # Step 4: Analyze root cause
        self.update_state(
            state="PROGRESS",
            meta={"current_step": "Analyzing root cause...", "progress": 55},
        )
        generated_content["root_cause"] = ai_service.generate_root_cause(
            title, slack_thread, logs, notes
        )

        # Step 5: Perform 5 Whys analysis
        self.update_state(
            state="PROGRESS",
            meta={"current_step": "Performing 5 Whys analysis...", "progress": 70},
        )
        generated_content["five_whys"] = ai_service.generate_five_whys(
            title, generated_content["root_cause"]
        )

        # Step 6: Generate lessons learned
        self.update_state(
            state="PROGRESS",
            meta={"current_step": "Documenting lessons learned...", "progress": 80},
        )
        generated_content["lessons_learned"] = ai_service.generate_lessons_learned(
            title, generated_content["root_cause"], generated_content["five_whys"]
        )

        # Step 7: Generate action items
        self.update_state(
            state="PROGRESS",
            meta={"current_step": "Generating action items...", "progress": 90},
        )
        action_items_data = ai_service.generate_action_items(
            title,
            generated_content["root_cause"],
            generated_content["five_whys"],
            generated_content["lessons_learned"],
        )

        for item in action_items_data:
            action_items.append({
                "description": item.get("description", ""),
                "owner": item.get("owner", ""),
                "priority": item.get("priority", "medium"),
                "status": "pending",
                "due_date": item.get("due_date"),
            })

        # Step 8: Update database
        self.update_state(
            state="PROGRESS",
            meta={"current_step": "Saving postmortem...", "progress": 95},
        )
        _update_postmortem_with_content(
            postmortem_id, generated_content, timeline_events, action_items
        )

        self.update_state(
            state="PROGRESS",
            meta={"current_step": "Complete!", "progress": 100},
        )

        return {"status": "completed", "postmortem_id": postmortem_id}

    except Exception as e:
        logger.error(f"Failed to generate postmortem {postmortem_id}: {e}")
        _update_postmortem_status(postmortem_id, "failed")
        raise


@celery.task(bind=True, name="regenerate_section")
def regenerate_section_task(self, postmortem_id: str, section: str):
    """Regenerate a specific section of a postmortem."""
    from app.services.ai_service import ai_service

    self.update_state(
        state="PROGRESS",
        meta={"current_step": f"Regenerating {section}...", "progress": 50},
    )

    session = get_sync_session()
    try:
        postmortem = session.query(Postmortem).filter(
            Postmortem.id == UUID(postmortem_id)
        ).first()

        if not postmortem:
            raise ValueError(f"Postmortem {postmortem_id} not found")

        # Regenerate based on section
        if section == "summary":
            postmortem.summary = ai_service.generate_summary(
                postmortem.title,
                postmortem.severity,
                postmortem.slack_thread,
                postmortem.logs,
                postmortem.notes,
            )
        elif section == "impact":
            postmortem.impact = ai_service.generate_impact(
                postmortem.title,
                postmortem.severity,
                postmortem.slack_thread,
                postmortem.logs,
            )
        elif section == "rootCause":
            postmortem.root_cause = ai_service.generate_root_cause(
                postmortem.title,
                postmortem.slack_thread,
                postmortem.logs,
                postmortem.notes,
            )
        elif section == "whys":
            postmortem.five_whys = ai_service.generate_five_whys(
                postmortem.title,
                postmortem.root_cause or "",
            )
        elif section == "lessonsLearned":
            postmortem.lessons_learned = ai_service.generate_lessons_learned(
                postmortem.title,
                postmortem.root_cause or "",
                postmortem.five_whys or [],
            )

        session.commit()
        return {"status": "completed", "section": section, "postmortem_id": postmortem_id}

    except Exception as e:
        logger.error(f"Failed to regenerate section {section} for {postmortem_id}: {e}")
        session.rollback()
        raise
    finally:
        session.close()


def _update_postmortem_with_content(
    postmortem_id: str,
    content: dict,
    timeline_events: list,
    action_items: list,
):
    """Update postmortem with generated content, timeline, and action items."""
    session = get_sync_session()
    try:
        postmortem = session.query(Postmortem).filter(
            Postmortem.id == UUID(postmortem_id)
        ).first()

        if not postmortem:
            raise ValueError(f"Postmortem {postmortem_id} not found")

        # Update main content
        postmortem.summary = content.get("summary")
        postmortem.impact = content.get("impact")
        postmortem.root_cause = content.get("root_cause")
        postmortem.five_whys = content.get("five_whys", [])
        postmortem.lessons_learned = content.get("lessons_learned", [])
        postmortem.duration = content.get("duration")
        postmortem.status = "completed"

        # Add timeline events
        for event_data in timeline_events:
            event = TimelineEvent(
                postmortem_id=postmortem.id,
                timestamp=event_data["timestamp"],
                event=event_data["event"],
                actor=event_data.get("actor"),
                order=event_data.get("order", 0),
            )
            session.add(event)

        # Add action items
        for item_data in action_items:
            due_date = None
            if item_data.get("due_date"):
                try:
                    due_date = datetime.strptime(item_data["due_date"], "%Y-%m-%d").date()
                except ValueError:
                    pass

            item = ActionItem(
                postmortem_id=postmortem.id,
                description=item_data["description"],
                owner=item_data.get("owner"),
                priority=item_data.get("priority", "medium"),
                status=item_data.get("status", "pending"),
                due_date=due_date,
            )
            session.add(item)

        session.commit()

    except Exception as e:
        session.rollback()
        raise
    finally:
        session.close()


def _update_postmortem_status(postmortem_id: str, status: str):
    """Update just the status of a postmortem."""
    session = get_sync_session()
    try:
        postmortem = session.query(Postmortem).filter(
            Postmortem.id == UUID(postmortem_id)
        ).first()

        if postmortem:
            postmortem.status = status
            session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Failed to update status for {postmortem_id}: {e}")
    finally:
        session.close()
