"""Legal Documentation Agent for contract generation."""

from typing import Any

from langchain_core.tools import tool

from app.agents.agent_registry import AgentRegistry
from app.agents.base_agent import AgentResult, AgentState, BaseAgent


# Mock Tools for Legal Agent
@tool
def generate_contract(
    template_type: str,
    customer_name: str,
    address: str,
    contract_terms: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Generate a legal contract based on a template.

    Args:
        template_type: Type of contract (e.g., "service_agreement", "nda")
        customer_name: Name of the customer
        address: Customer address
        contract_terms: Specific terms to include

    Returns:
        Result with generated document ID and URL
    """
    # Mock implementation
    doc_id = f"contract_{template_type}_{hash(customer_name)}"
    return {
        "status": "generated",
        "document_id": doc_id,
        "document_url": f"https://mock-storage.com/{doc_id}.pdf",
        "template_used": template_type,
        "metadata": {"page_count": 5, "generated_at": "2024-02-01T12:00:00Z"},
    }


@tool
def trigger_esign(document_id: str, signer_email: str, signer_name: str) -> dict[str, Any]:
    """
    Send a document for electronic signature.

    Args:
        document_id: ID of the document to sign
        signer_email: Email address of the signer
        signer_name: Name of the signer

    Returns:
        Envelope ID and status
    """
    # Mock implementation
    return {
        "status": "sent",
        "envelope_id": f"env_{document_id}",
        "signer": signer_email,
        "provider": "docusign_mock",
    }


@AgentRegistry.register("legal")
class LegalAgent(BaseAgent):
    """
    Agent responsible for generating and managing legal documents.

    Handles contract generation, validation, and e-signature workflows.
    """

    def __init__(self, **kwargs):
        super().__init__(
            name="legal_agent",
            description="Generates contracts and manages e-signatures",
            **kwargs,
        )

    async def initialize(self) -> None:
        """Initialize tools and LLM chain."""
        self.tools = [generate_contract, trigger_esign]

    def get_tools(self) -> list[Any]:
        """Return available tools."""
        return self.tools

    async def execute(self, task: dict[str, Any], state: AgentState) -> AgentResult:
        """
        Execute legal documentation task.

        Generates contracts and initiates e-signatures based on
        workflow requirements.
        """
        action = task.get("action", "generate_and_send")
        customer_data = task.get("customer_data", {})

        results = {}
        tool_calls = []

        if action in ["generate", "generate_and_send"]:
            tool_calls.append("generate_contract")

            # Determine contract type
            contract_type = "service_agreement"
            if customer_data.get("customer_type") == "enterprise":
                contract_type = "master_service_agreement"

            contract_result = generate_contract.invoke(
                {
                    "template_type": contract_type,
                    "customer_name": customer_data.get("name", "Unknown"),
                    "address": customer_data.get("address", "Unknown Address"),
                    "contract_terms": task.get("terms", {}),
                }
            )
            results["contract"] = contract_result

            # If we need to send it immediately
            if action == "generate_and_send" and contract_result.get("status") == "generated":
                doc_id = contract_result["document_id"]
                tool_calls.append("trigger_esign")

                esign_result = trigger_esign.invoke(
                    {
                        "document_id": doc_id,
                        "signer_email": customer_data.get("email", ""),
                        "signer_name": customer_data.get("name", ""),
                    }
                )
                results["esign"] = esign_result

        success = True
        return AgentResult(
            success=success, data=results, confidence_score=1.0, tool_calls=tool_calls
        )
