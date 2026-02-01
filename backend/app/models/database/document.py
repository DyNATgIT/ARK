"""Document tracking database model."""

import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.database.base import BaseModel

if TYPE_CHECKING:
    from app.models.database.customer import Customer


class DocumentType(str, enum.Enum):
    """Type of document."""

    ID_DOCUMENT = "id_document"
    BUSINESS_LICENSE = "business_license"
    CONTRACT = "contract"
    SIGNED_CONTRACT = "signed_contract"
    TAX_DOCUMENT = "tax_document"
    BANK_STATEMENT = "bank_statement"
    PROOF_OF_ADDRESS = "proof_of_address"
    OTHER = "other"


class DocumentStatus(str, enum.Enum):
    """Document processing status."""

    PENDING = "pending"
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"


class Document(BaseModel):
    """Document uploaded or generated during onboarding."""

    __tablename__ = "documents"

    # Customer reference
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False, index=True
    )

    # Document info
    document_type: Mapped[DocumentType] = mapped_column(Enum(DocumentType), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Storage
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)  # bytes

    # Status
    status: Mapped[DocumentStatus] = mapped_column(
        Enum(DocumentStatus), default=DocumentStatus.PENDING
    )

    # Verification
    verified_by_agent: Mapped[str | None] = mapped_column(String(100), nullable=True)
    verification_result: Mapped[dict] = mapped_column(JSONB, default=dict)
    verification_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # E-signature tracking
    esign_envelope_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    esign_status: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Extracted data
    extracted_data: Mapped[dict] = mapped_column(JSONB, default=dict)

    # Relationships
    customer: Mapped["Customer"] = relationship("Customer", back_populates="documents")
