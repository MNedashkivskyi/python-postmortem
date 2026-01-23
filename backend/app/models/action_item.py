"""
ActionItem SQLAlchemy model.

TODO: Implement full model with relationships.
"""


class ActionItem:
    """
    Action item database model.

    Columns:
    - id: UUID primary key
    - postmortem_id: Foreign key to postmortems
    - description: Action item description
    - owner: Person responsible
    - due_date: Due date
    - priority: high, medium, low
    - status: open, in_progress, completed, cancelled
    - order_index: Order within the list
    - created_at: Creation timestamp
    - updated_at: Last update timestamp
    """

    __tablename__ = "action_items"

    # TODO: Implement with SQLAlchemy Base
    pass
