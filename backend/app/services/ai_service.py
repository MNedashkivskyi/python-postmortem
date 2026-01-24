"""AI Service for postmortem generation using Anthropic Claude API."""

import json
from typing import Optional, List, Dict, Any

from anthropic import Anthropic

from app.core.config import settings


class AIService:
    """Service for generating postmortem content using Claude API."""

    def __init__(self):
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = "claude-sonnet-4-20250514"

    def _call_claude(self, system_prompt: str, user_prompt: str) -> str:
        """Make a call to Claude API."""
        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_prompt}
            ]
        )
        return message.content[0].text

    def generate_summary(
        self,
        title: str,
        severity: str,
        slack_thread: Optional[str],
        logs: Optional[str],
        notes: Optional[str],
    ) -> str:
        """Generate an executive summary for the postmortem."""
        system_prompt = """You are an expert Site Reliability Engineer writing incident postmortems.
Generate a concise executive summary (2-3 paragraphs) that covers:
- What happened
- The scope and severity of the impact
- How it was resolved
Keep it professional and factual. Do not include speculation."""

        user_prompt = f"""Generate an executive summary for this incident:

Title: {title}
Severity: {severity}

Slack Thread/Communications:
{slack_thread or 'Not provided'}

System Logs:
{logs or 'Not provided'}

Additional Notes:
{notes or 'Not provided'}"""

        return self._call_claude(system_prompt, user_prompt)

    def generate_impact(
        self,
        title: str,
        severity: str,
        slack_thread: Optional[str],
        logs: Optional[str],
    ) -> str:
        """Generate impact assessment."""
        system_prompt = """You are an expert Site Reliability Engineer assessing incident impact.
Generate a detailed impact assessment that covers:
- Number of users/customers affected (estimate if not explicitly stated)
- Duration of impact
- Business impact (revenue, SLA, reputation)
- Technical systems affected
Keep it factual and quantitative where possible."""

        user_prompt = f"""Assess the impact of this incident:

Title: {title}
Severity: {severity}

Slack Thread/Communications:
{slack_thread or 'Not provided'}

System Logs:
{logs or 'Not provided'}"""

        return self._call_claude(system_prompt, user_prompt)

    def generate_timeline(
        self,
        slack_thread: Optional[str],
        logs: Optional[str],
    ) -> List[Dict[str, str]]:
        """Generate incident timeline from communications and logs."""
        system_prompt = """You are an expert Site Reliability Engineer creating incident timelines.
Extract a chronological timeline of events from the provided data.
Return a JSON array of objects with these fields:
- timestamp: ISO 8601 format (e.g., "2024-01-15T14:23:00Z")
- event: Description of what happened
- actor: Who performed the action or what system reported it

Return ONLY valid JSON, no other text."""

        user_prompt = f"""Extract the incident timeline from this data:

Slack Thread/Communications:
{slack_thread or 'Not provided'}

System Logs:
{logs or 'Not provided'}"""

        response = self._call_claude(system_prompt, user_prompt)

        try:
            # Try to parse as JSON
            timeline = json.loads(response)
            if isinstance(timeline, list):
                return timeline
        except json.JSONDecodeError:
            # If parsing fails, try to extract JSON from the response
            import re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass

        # Return empty list if parsing fails
        return []

    def generate_root_cause(
        self,
        title: str,
        slack_thread: Optional[str],
        logs: Optional[str],
        notes: Optional[str],
    ) -> str:
        """Generate root cause analysis."""
        system_prompt = """You are an expert Site Reliability Engineer performing root cause analysis.
Identify and explain the root cause of the incident:
- What was the fundamental issue that caused this incident?
- What conditions allowed this to happen?
- What was the trigger that initiated the incident?
Be specific and technical. Distinguish between root cause and contributing factors."""

        user_prompt = f"""Analyze the root cause of this incident:

Title: {title}

Slack Thread/Communications:
{slack_thread or 'Not provided'}

System Logs:
{logs or 'Not provided'}

Additional Notes:
{notes or 'Not provided'}"""

        return self._call_claude(system_prompt, user_prompt)

    def generate_five_whys(
        self,
        title: str,
        root_cause: str,
    ) -> List[Dict[str, str]]:
        """Generate 5 Whys analysis."""
        system_prompt = """You are an expert Site Reliability Engineer performing 5 Whys analysis.
Generate a 5 Whys chain that digs deeper into the root cause.
Return a JSON array of objects with these fields:
- question: The "Why" question
- answer: The answer that leads to the next question

The chain should progressively uncover deeper systemic issues.
Return ONLY valid JSON, no other text."""

        user_prompt = f"""Perform a 5 Whys analysis for this incident:

Title: {title}
Root Cause: {root_cause}"""

        response = self._call_claude(system_prompt, user_prompt)

        try:
            whys = json.loads(response)
            if isinstance(whys, list):
                return whys
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass

        return []

    def generate_lessons_learned(
        self,
        title: str,
        root_cause: str,
        five_whys: List[Dict[str, str]],
    ) -> List[str]:
        """Generate lessons learned."""
        system_prompt = """You are an expert Site Reliability Engineer documenting lessons learned.
Generate 3-5 key lessons learned from this incident.
Focus on:
- What we learned about our systems
- What we learned about our processes
- What we should do differently
Return a JSON array of strings.
Return ONLY valid JSON, no other text."""

        whys_text = "\n".join([f"- {w.get('question', '')}: {w.get('answer', '')}" for w in five_whys])

        user_prompt = f"""Generate lessons learned for this incident:

Title: {title}
Root Cause: {root_cause}

5 Whys Analysis:
{whys_text}"""

        response = self._call_claude(system_prompt, user_prompt)

        try:
            lessons = json.loads(response)
            if isinstance(lessons, list):
                return lessons
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass

        return []

    def generate_action_items(
        self,
        title: str,
        root_cause: str,
        five_whys: List[Dict[str, str]],
        lessons_learned: List[str],
    ) -> List[Dict[str, Any]]:
        """Generate action items."""
        system_prompt = """You are an expert Site Reliability Engineer creating action items.
Generate 3-6 actionable follow-up items to prevent recurrence.
Return a JSON array of objects with these fields:
- description: Clear, specific action to take
- owner: Suggested team/role to own this (e.g., "Platform Team", "On-call Engineer")
- priority: "high", "medium", or "low"
- due_date: Suggested due date in YYYY-MM-DD format (within 30 days for high, 60 for medium, 90 for low)

Return ONLY valid JSON, no other text."""

        whys_text = "\n".join([f"- {w.get('question', '')}: {w.get('answer', '')}" for w in five_whys])
        lessons_text = "\n".join([f"- {l}" for l in lessons_learned])

        user_prompt = f"""Generate action items for this incident:

Title: {title}
Root Cause: {root_cause}

5 Whys Analysis:
{whys_text}

Lessons Learned:
{lessons_text}"""

        response = self._call_claude(system_prompt, user_prompt)

        try:
            actions = json.loads(response)
            if isinstance(actions, list):
                return actions
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass

        return []

    def estimate_duration(
        self,
        timeline: List[Dict[str, str]],
    ) -> int:
        """Estimate incident duration in minutes from timeline."""
        if not timeline or len(timeline) < 2:
            return 0

        try:
            from datetime import datetime

            # Parse first and last timestamps
            first = timeline[0].get("timestamp", "")
            last = timeline[-1].get("timestamp", "")

            if first and last:
                start = datetime.fromisoformat(first.replace("Z", "+00:00"))
                end = datetime.fromisoformat(last.replace("Z", "+00:00"))
                duration = (end - start).total_seconds() / 60
                return max(1, int(duration))
        except (ValueError, KeyError):
            pass

        return 0


# Singleton instance
ai_service = AIService()
