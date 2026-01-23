"""
TimelineEvent SQLAlchemy model.

TODO: Implement full model with relationships.
"""


class TimelineEvent:
    """
    Timeline event database model.

    Columns:
    - id: UUID primary key
    - postmortem_id: Foreign key to postmortems
    - timestamp: Event timestamp
    - description: Event description
    - event_type: detection, response, mitigation, resolution, event
    - source: Source of the event (e.g., Slack, Datadog)
    - order_index: Order within the timeline
    - created_at: Creation timestamp
    - updated_at: Last update timestamp
    """

    __tablename__ = "timeline_events"

    # TODO: Implement with SQLAlchemy Base
    pass
