"""Customer entity database model."""

import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.database.base import BaseModel

if TYPE_CHECKING:
    from app.models.database.document import Document
    from app.models.database.onboarding_workflow import OnboardingWorkflow


class CustomerType(str, enum.Enum):
    """Type of customer."""

    INDIVIDUAL = "individual"
    BUSINESS = "business"
    ENTERPRISE = "enterprise"


class CustomerStatus(str, enum.Enum):
    """Customer lifecycle status."""

    LEAD = "lead"
    PROSPECT = "prospect"
    ONBOARDING = "onboarding"
    ACTIVE = "active"
    CHURNED = "churned"


class Customer(BaseModel):
    """Customer entity representing a customer being onboarded."""

    __tablename__ = "customers"

    # Basic Information
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Business Information
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    company_size: Mapped[str | None] = mapped_column(String(50), nullable=True)
    industry: Mapped[str | None] = mapped_column(String(100), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Address
    address_line1: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address_line2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    country: Mapped[str] = mapped_column(String(2), default="US")

    # Classification
    customer_type: Mapped[CustomerType] = mapped_column(
        Enum(CustomerType), default=CustomerType.INDIVIDUAL
    )
    status: Mapped[CustomerStatus] = mapped_column(
        Enum(CustomerStatus), default=CustomerStatus.LEAD
    )

    # External IDs (CRM, etc.)
    external_ids: Mapped[dict] = mapped_column(JSONB, default=dict)

    # Additional metadata
    additional_metadata: Mapped[dict] = mapped_column(JSONB, default=dict)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Source tracking
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    referral_code: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Assigned user
    assigned_to_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    # Relationships
    workflows: Mapped[list["OnboardingWorkflow"]] = relationship(
        "OnboardingWorkflow", back_populates="customer", lazy="selectin"
    )
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="customer", lazy="selectin"
    )

    @property
    def full_name(self) -> str:
        """Get customer's full name."""
        return f"{self.first_name} {self.last_name}"
