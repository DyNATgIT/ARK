"""Customer Pydantic schemas."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import EmailStr, Field, field_validator

from app.models.database.customer import CustomerStatus, CustomerType
from app.models.schemas.common import BaseSchema, IDSchema, TimestampSchema


class CustomerBase(BaseSchema):
    """Base customer schema with common fields."""

    email: EmailStr
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: str | None = Field(None, max_length=50)

    # Business info
    company_name: str | None = Field(None, max_length=255)
    company_size: str | None = Field(None, max_length=50)
    industry: str | None = Field(None, max_length=100)
    website: str | None = Field(None, max_length=500)

    # Address
    address_line1: str | None = Field(None, max_length=255)
    address_line2: str | None = Field(None, max_length=255)
    city: str | None = Field(None, max_length=100)
    state: str | None = Field(None, max_length=100)
    postal_code: str | None = Field(None, max_length=20)
    country: str = Field(default="US", min_length=2, max_length=2)

    # Classification
    customer_type: CustomerType = CustomerType.INDIVIDUAL

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        """Basic phone validation."""
        if v is not None:
            # Remove common formatting characters
            cleaned = "".join(c for c in v if c.isdigit() or c == "+")
            if len(cleaned) < 10:
                raise ValueError("Phone number too short")
        return v


class CustomerCreate(CustomerBase):
    """Schema for creating a customer."""

    source: str | None = None
    referral_code: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    notes: str | None = None


class CustomerUpdate(BaseSchema):
    """Schema for updating a customer (all fields optional)."""

    email: EmailStr | None = None
    first_name: str | None = Field(None, min_length=1, max_length=100)
    last_name: str | None = Field(None, min_length=1, max_length=100)
    phone: str | None = None
    company_name: str | None = None
    company_size: str | None = None
    industry: str | None = None
    website: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = None
    customer_type: CustomerType | None = None
    status: CustomerStatus | None = None
    metadata: dict[str, Any] | None = None
    notes: str | None = None


class CustomerResponse(CustomerBase, IDSchema, TimestampSchema):
    """Customer response schema."""

    status: CustomerStatus
    external_ids: dict[str, Any]
    metadata: dict[str, Any]
    notes: str | None
    source: str | None
    assigned_to_id: UUID | None

    @property
    def full_name(self) -> str:
        """Get full name."""
        return f"{self.first_name} {self.last_name}"


class CustomerListItem(IDSchema):
    """Minimal customer schema for list views."""

    email: str
    first_name: str
    last_name: str
    company_name: str | None
    customer_type: CustomerType
    status: CustomerStatus
    created_at: datetime
