"""Agents module initialization."""

from app.agents.agent_registry import AgentRegistry
from app.agents.base_agent import BaseAgent
from app.agents.communication_agent import CommunicationAgent
from app.agents.crm_agent import CRMAgent
from app.agents.identity_agent import IdentityAgent
from app.agents.it_agent import ITAgent
from app.agents.legal_agent import LegalAgent

__all__ = [
    "BaseAgent",
    "IdentityAgent",
    "LegalAgent",
    "CRMAgent",
    "ITAgent",
    "CommunicationAgent",
    "AgentRegistry",
]
