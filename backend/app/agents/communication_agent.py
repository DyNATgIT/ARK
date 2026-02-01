"""Communication Agent for notifications."""

from typing import Any

from langchain_core.tools import tool

from app.agents.agent_registry import AgentRegistry
from app.agents.base_agent import AgentResult, AgentState, BaseAgent


# Mock Tools for Communication Agent
@tool
def send_email(
    to_email: str, subject: str, template_id: str, variables: dict[str, Any]
) -> dict[str, Any]:
    """
    Send an email using a template.

    Args:
        to_email: Recipient email
        subject: Email subject
        template_id: Template identifier
        variables: Variables to inject into template

    Returns:
        Send status and message ID
    """
    # Mock implementation
    return {
        "status": "sent",
        "message_id": f"msg_{hash(to_email + template_id)}",
        "recipient": to_email,
        "template": template_id,
    }


@tool
def send_slack_notification(
    channel: str, message: str, mentions: list[str] | None = None
) -> dict[str, Any]:
    """
    Send a notification to a Slack channel.

    Args:
        channel: Channel name or ID
        message: Message content
        mentions: List of user IDs to mention

    Returns:
        Send status
    """
    # Mock implementation
    return {
        "status": "sent",
        "channel": channel,
        "timestamp": "1234567890.123456",
        "mentions_count": len(mentions or []),
    }


@AgentRegistry.register("communication")
class CommunicationAgent(BaseAgent):
    """
    Agent responsible for sending communications.

    Handles email notifications, Slack alerts, and other messaging
    channels to keep stakeholders informed.
    """

    def __init__(self, **kwargs):
        super().__init__(
            name="communication_agent",
            description="Sends emails and notifications",
            **kwargs,
        )

    async def initialize(self) -> None:
        """Initialize tools."""
        self.tools = [send_email, send_slack_notification]

    def get_tools(self) -> list[Any]:
        """Return available tools."""
        return self.tools

    async def execute(self, task: dict[str, Any], state: AgentState) -> AgentResult:
        """
        Execute communication task.

        Sends emails or notifications based on the task type.
        """
        notification_type = task.get("type", "email")
        recipient = task.get("recipient", "")

        results = {}
        tool_calls = []

        if notification_type in ["email", "all"]:
            tool_calls.append("send_email")
            email_result = send_email.invoke(
                {
                    "to_email": recipient,
                    "subject": task.get("subject", "Notification"),
                    "template_id": task.get("template", "default_template"),
                    "variables": task.get("variables", {}),
                }
            )
            results["email"] = email_result

        if notification_type in ["slack", "all"]:
            tool_calls.append("send_slack_notification")
            slack_result = send_slack_notification.invoke(
                {
                    "channel": task.get("channel", "#general"),
                    "message": task.get("message", "Update available"),
                    "mentions": task.get("mentions", []),
                }
            )
            results["slack"] = slack_result

        return AgentResult(success=True, data=results, confidence_score=1.0, tool_calls=tool_calls)
