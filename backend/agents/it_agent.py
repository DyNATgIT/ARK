"""IT Provisioning Agent for account management."""

from typing import Any

from langchain_core.tools import tool

from app.agents.agent_registry import AgentRegistry
from app.agents.base_agent import AgentResult, AgentState, BaseAgent


# Mock Tools for IT Agent
@tool
def provision_account(employee_id: str, email: str, services: list[str]) -> dict[str, Any]:
    """
    Provision IT accounts for a new user.

    Args:
        employee_id: Internal employee/customer ID
        email: Work email to create
        services: List of services to provision (e.g., "slack", "jira", "aws")

    Returns:
        Provisioning status and credentials
    """
    # Mock implementation
    return {
        "status": "provisioned",
        "employee_id": employee_id,
        "email": email,
        "services_provisioned": services,
        "sso_link": f"https://sso.example.com/setup/{employee_id}",
        "temporary_password": f"Welcome{employee_id[-4:]}!",
    }


@tool
def assign_permissions(email: str, role: str, groups: list[str]) -> dict[str, Any]:
    """
    Assign role-based access control permissions.

    Args:
        email: User email
        role: Primary role (e.g., "developer", "manager")
        groups: Access groups to add user to

    Returns:
        Permission assignment status
    """
    # Mock implementation
    return {
        "status": "assigned",
        "email": email,
        "role": role,
        "groups_added": groups,
        "effective_date": "2024-02-01",
    }


@AgentRegistry.register("it")
class ITAgent(BaseAgent):
    """
    Agent responsible for IT provisioning and access management.

    Creates user accounts, assigns permissions, and configures SSO
    access for new customers or employees.
    """

    def __init__(self, **kwargs):
        super().__init__(
            name="it_agent",
            description="Provisions IT accounts and access",
            **kwargs,
        )

    async def initialize(self) -> None:
        """Initialize tools."""
        self.tools = [provision_account, assign_permissions]

    def get_tools(self) -> list[Any]:
        """Return available tools."""
        return self.tools

    async def execute(self, task: dict[str, Any], state: AgentState) -> AgentResult:
        """
        Execute IT provisioning task.

        Provisions accounts and assigns initial permissions.
        """
        customer_data = task.get("customer_data", {})
        customer_id = task.get("customer_id", "000")

        results = {}
        tool_calls = []

        # Provision accounts
        tool_calls.append("provision_account")
        services = ["slack", "email"]
        if customer_data.get("customer_type") == "enterprise":
            services.extend(["jira", "confluence"])

        provision_result = provision_account.invoke(
            {
                "employee_id": customer_id,
                "email": customer_data.get("email", f"user_{customer_id}@example.com"),
                "services": services,
            }
        )
        results["provisioning"] = provision_result

        # Assign permissions
        tool_calls.append("assign_permissions")
        perm_result = assign_permissions.invoke(
            {
                "email": provision_result["email"],
                "role": "customer_admin",
                "groups": ["customer_portal_users"],
            }
        )
        results["permissions"] = perm_result

        return AgentResult(success=True, data=results, confidence_score=1.0, tool_calls=tool_calls)
