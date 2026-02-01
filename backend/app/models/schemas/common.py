"""Common/shared Pydantic schemas."""

from datetime import datetime
from typing import Any, Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

DataT = TypeVar("DataT")


class BaseSchema(BaseModel):
    """Base schema with common configuration."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        str_strip_whitespace=True,
    )


class TimestampSchema(BaseSchema):
    """Schema with timestamp fields."""

    created_at: datetime
    updated_at: datetime


class IDSchema(BaseSchema):
    """Schema with ID field."""

    id: UUID


class BaseResponse(BaseSchema, Generic[DataT]):
    """Standard API response wrapper."""

    success: bool = True
    message: str = "Success"
    data: DataT | None = None


class PaginatedResponse(BaseSchema, Generic[DataT]):
    """Paginated response wrapper."""

    items: list[DataT]
    total: int
    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=100)
    total_pages: int

    @property
    def has_next(self) -> bool:
        """Check if there's a next page."""
        return self.page < self.total_pages

    @property
    def has_previous(self) -> bool:
        """Check if there's a previous page."""
        return self.page > 1


class ErrorResponse(BaseSchema):
    """Error response schema."""

    success: bool = False
    error: str
    error_code: str | None = None
    details: dict[str, Any] | None = None


class HealthResponse(BaseSchema):
    """Health check response."""

    status: str = "healthy"
    version: str
    environment: str
    database: str = "connected"
    redis: str = "connected"
