"""Custom exception classes for the application."""

from typing import Any

from fastapi import HTTPException, status


class AppException(Exception):
    """Base application exception."""

    def __init__(self, message: str, details: dict[str, Any] | None = None) -> None:
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class NotFoundError(AppException):
    """Resource not found exception."""

    pass


class ValidationError(AppException):
    """Data validation exception."""

    pass


class AuthenticationError(AppException):
    """Authentication failure exception."""

    pass


class AuthorizationError(AppException):
    """Authorization failure exception."""

    pass


class IntegrationError(AppException):
    """External integration failure exception."""

    def __init__(
        self,
        message: str,
        integration_name: str,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.integration_name = integration_name
        super().__init__(message, details)


class WorkflowError(AppException):
    """Workflow execution exception."""

    def __init__(
        self,
        message: str,
        workflow_id: str,
        step_id: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.workflow_id = workflow_id
        self.step_id = step_id
        super().__init__(message, details)


class AgentError(AppException):
    """Agent execution exception."""

    def __init__(
        self,
        message: str,
        agent_name: str,
        tool_name: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.agent_name = agent_name
        self.tool_name = tool_name
        super().__init__(message, details)


# HTTP Exception helpers
def raise_not_found(resource: str, resource_id: str) -> None:
    """Raise 404 Not Found exception."""
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource} with id '{resource_id}' not found",
    )


def raise_bad_request(message: str) -> None:
    """Raise 400 Bad Request exception."""
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=message,
    )


def raise_unauthorized(message: str = "Invalid authentication credentials") -> None:
    """Raise 401 Unauthorized exception."""
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
        headers={"WWW-Authenticate": "Bearer"},
    )


def raise_forbidden(message: str = "Insufficient permissions") -> None:
    """Raise 403 Forbidden exception."""
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=message,
    )
