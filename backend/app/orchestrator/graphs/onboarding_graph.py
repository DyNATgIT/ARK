from typing import Any, Literal

import structlog
from langgraph.graph import END, StateGraph

from app.agents.agent_registry import AgentRegistry
from app.orchestrator.workflow_engine import OnboardingState

logger = structlog.get_logger()


# Node functions for each phase of the workflow


async def intake_node(state: OnboardingState) -> dict[str, Any]:
    """
    Process customer intake data.

    Validates and normalizes incoming customer data,
    prepares it for subsequent processing steps.
    """
    await logger.ainfo("intake_node_started", workflow_id=state["workflow_id"])

    # Validate customer data
    customer_data = state["customer_data"]
    validated_data = {
        "customer_id": state["customer_id"],
        "email": customer_data.get("email", ""),
        "name": f"{customer_data.get('first_name', '')} {customer_data.get('last_name', '')}",
        "company": customer_data.get("company_name"),
        "customer_type": customer_data.get("customer_type", "individual"),
        "address": customer_data.get("address", ""),
    }

    return {
        "intake_result": {
            "status": "completed",
            "validated_data": validated_data,
        },
        "current_phase": "parallel_processing",
        "completed_phases": state["completed_phases"] + ["intake"],
    }


async def identity_verification_node(state: OnboardingState) -> dict[str, Any]:
    """Run identity verification checks using Identity Agent."""
    workflow_id = state["workflow_id"]
    await logger.ainfo("identity_verification_started", workflow_id=workflow_id)

    agent = AgentRegistry.create("identity")
    if not agent:
        raise ValueError("Identity Agent not found in registry")

    # Prepare task for agent
    intake_data = state.get("intake_result", {}).get("validated_data", {})
    task = {"type": "verify_identity", "customer_data": intake_data, "workflow_id": workflow_id}

    # Execute agent
    result = await agent.run(task)

    return {
        "identity_verification_result": {
            "status": "completed" if result.success else "failed",
            "verified": result.success,
            "confidence_score": result.confidence_score,
            "details": result.data,
            "error": result.error,
        },
    }


async def legal_documents_node(state: OnboardingState) -> dict[str, Any]:
    """Generate and manage legal documents using Legal Agent."""
    workflow_id = state["workflow_id"]
    await logger.ainfo("legal_documents_started", workflow_id=workflow_id)

    agent = AgentRegistry.create("legal")
    if not agent:
        raise ValueError("Legal Agent not found in registry")

    # Prepare task
    intake_data = state.get("intake_result", {}).get("validated_data", {})
    task = {
        "action": "generate_and_send",
        "customer_data": intake_data,
        "terms": state.get("context", {}).get("contract_terms", {}),
    }

    # Execute agent
    result = await agent.run(task)

    return {
        "legal_documents_result": {
            "status": "completed" if result.success else "failed",
            "contract_generated": result.success,
            "esign_status": "sent" if result.success else "failed",
            "details": result.data,
            "document_ids": [
                d.get("document_id")
                for d in result.data.values()
                if isinstance(d, dict) and "document_id" in d
            ],
        },
    }


async def crm_setup_node(state: OnboardingState) -> dict[str, Any]:
    """Set up CRM records using CRM Agent."""
    workflow_id = state["workflow_id"]
    await logger.ainfo("crm_setup_started", workflow_id=workflow_id)

    agent = AgentRegistry.create("crm")
    if not agent:
        raise ValueError("CRM Agent not found in registry")

    intake_data = state.get("intake_result", {}).get("validated_data", {})
    task = {"action": "create_account", "customer_data": intake_data, "platform": "salesforce"}

    result = await agent.run(task)

    return {
        "crm_setup_result": {
            "status": "completed" if result.success else "failed",
            "record_created": result.success,
            "details": result.data,
        },
    }


async def parallel_processing_node(state: OnboardingState) -> dict[str, Any]:
    """
    Coordinate parallel execution of identity, legal, and CRM tasks.

    This is a synchronization point that triggers parallel agent execution.
    """
    await logger.ainfo("parallel_processing_started", workflow_id=state["workflow_id"])

    # In actual implementation, this would trigger parallel execution
    # For now, we'll call each sequentially but mark them as parallel-capable
    return {
        "current_phase": "human_review_check",
        "completed_phases": state["completed_phases"] + ["parallel_processing"],
    }


async def human_review_check_node(state: OnboardingState) -> dict[str, Any]:
    """Check if human review is required."""
    await logger.ainfo("human_review_check", workflow_id=state["workflow_id"])

    identity_result = state.get("identity_result", {})
    confidence = identity_result.get("confidence_score", 1.0)

    # Check for errors in any previous steps
    errors = []
    if not identity_result.get("verified"):
        errors.append("Identity verification failed")
    if not state.get("legal_result", {}).get("contract_generated"):
        errors.append("Contract generation failed")
    if not state.get("crm_result", {}).get("record_created"):
        errors.append("CRM setup failed")

    requires_review = confidence < 0.8 or len(errors) > 0

    if requires_review:
        return {
            "requires_human_review": True,
            "human_review_reason": f"Issues detected: {', '.join(errors)}"
            if errors
            else "Low confidence score",
            "errors": [{"message": e} for e in errors],
            "current_phase": "awaiting_approval",
        }

    return {
        "requires_human_review": False,
        "current_phase": "provisioning",
        "completed_phases": state["completed_phases"] + ["human_review_check"],
    }


async def provisioning_node(state: OnboardingState) -> dict[str, Any]:
    """Provision IT resources using IT Agent."""
    workflow_id = state["workflow_id"]
    await logger.ainfo("provisioning_started", workflow_id=workflow_id)

    agent = AgentRegistry.create("it")
    if not agent:
        raise ValueError("IT Agent not found in registry")

    intake_data = state.get("intake_result", {}).get("validated_data", {})
    task = {
        "customer_id": state["customer_id"],
        "customer_data": intake_data,
    }

    result = await agent.run(task)

    return {
        "provisioning_result": {
            "status": "completed" if result.success else "failed",
            "details": result.data,
            "access_granted": result.success,
        },
        "training_result": {
            "status": "completed",
            "courses_assigned": ["onboarding_101", "security_basics"],
        },
        "current_phase": "notification",
        "completed_phases": state["completed_phases"] + ["provisioning"],
    }


async def notification_node(state: OnboardingState) -> dict[str, Any]:
    """Send completion notifications using Communication Agent."""
    workflow_id = state["workflow_id"]
    await logger.ainfo("notification_started", workflow_id=workflow_id)

    agent = AgentRegistry.create("communication")
    if not agent:
        raise ValueError("Communication Agent not found in registry")

    intake_data = state.get("intake_result", {}).get("validated_data", {})
    task = {
        "type": "all",
        "recipient": intake_data.get("email"),
        "subject": "Onboarding Complete",
        "message": f"Welcome aboard, {intake_data.get('name')}! Your account setup is complete.",
    }

    result = await agent.run(task)

    return {
        "current_phase": "completed",
        "completed_phases": state["completed_phases"] + ["notification"],
        "context": {
            **state.get("context", {}),
            "notifications_sent": result.success,
        },
    }


def should_continue_to_provisioning(
    state: OnboardingState,
) -> Literal["provisioning", "await_approval"]:
    """Routing function to determine next step after human review check."""
    if state.get("requires_human_review", False):
        return "await_approval"
    return "provisioning"


def build_onboarding_graph() -> StateGraph:
    """
    Build the complete onboarding workflow graph.

    Returns a StateGraph with all nodes and conditional edges.
    """
    # Create the graph with OnboardingState
    graph = StateGraph(OnboardingState)

    # Add nodes
    graph.add_node("intake", intake_node)
    graph.add_node("parallel_processing", parallel_processing_node)
    graph.add_node("identity_verification", identity_verification_node)
    graph.add_node("legal_documents", legal_documents_node)
    graph.add_node("crm_setup", crm_setup_node)
    graph.add_node("human_review_check", human_review_check_node)
    graph.add_node("provisioning", provisioning_node)
    graph.add_node("notification", notification_node)

    # Set entry point
    graph.set_entry_point("intake")

    # Add edges
    graph.add_edge("intake", "parallel_processing")

    # Parallel processing triggers multiple nodes
    # In production, these would run in parallel
    graph.add_edge("parallel_processing", "identity_verification")
    graph.add_edge("identity_verification", "legal_documents")
    graph.add_edge("legal_documents", "crm_setup")
    graph.add_edge("crm_setup", "human_review_check")

    # Conditional routing after human review check
    graph.add_conditional_edges(
        "human_review_check",
        should_continue_to_provisioning,
        {
            "provisioning": "provisioning",
            "await_approval": END,  # Pause for human approval
        },
    )

    graph.add_edge("provisioning", "notification")
    graph.add_edge("notification", END)

    return graph
