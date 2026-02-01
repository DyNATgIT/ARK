"""Customer management endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import raise_not_found
from app.database.session import get_db_session
from app.models.database.customer import Customer
from app.models.schemas.common import BaseResponse, PaginatedResponse
from app.models.schemas.customer import (
    CustomerCreate,
    CustomerListItem,
    CustomerResponse,
    CustomerUpdate,
)

router = APIRouter()


@router.post("", response_model=BaseResponse[CustomerResponse], status_code=201)
async def create_customer(
    customer_data: CustomerCreate,
    db: AsyncSession = Depends(get_db_session),
) -> BaseResponse[CustomerResponse]:
    """
    Create a new customer.

    This creates a customer record that can later be used to start
    an onboarding workflow.
    """
    customer = Customer(**customer_data.model_dump())
    db.add(customer)
    await db.flush()
    await db.refresh(customer)

    return BaseResponse(
        message="Customer created successfully",
        data=CustomerResponse.model_validate(customer),
    )


@router.get("", response_model=PaginatedResponse[CustomerListItem])
async def list_customers(
    db: AsyncSession = Depends(get_db_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, description="Search by name or email"),
) -> PaginatedResponse[CustomerListItem]:
    """
    List customers with pagination.

    Supports search by name or email.
    """
    # Base query
    query = select(Customer)

    # Apply search filter
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (Customer.email.ilike(search_filter))
            | (Customer.first_name.ilike(search_filter))
            | (Customer.last_name.ilike(search_filter))
            | (Customer.company_name.ilike(search_filter))
        )

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(Customer.created_at.desc())

    result = await db.execute(query)
    customers = result.scalars().all()

    return PaginatedResponse(
        items=[CustomerListItem.model_validate(c) for c in customers],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{customer_id}", response_model=BaseResponse[CustomerResponse])
async def get_customer(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db_session),
) -> BaseResponse[CustomerResponse]:
    """Get customer by ID."""
    customer = await db.get(Customer, customer_id)
    if not customer:
        raise_not_found("Customer", str(customer_id))

    return BaseResponse(data=CustomerResponse.model_validate(customer))


@router.patch("/{customer_id}", response_model=BaseResponse[CustomerResponse])
async def update_customer(
    customer_id: UUID,
    customer_data: CustomerUpdate,
    db: AsyncSession = Depends(get_db_session),
) -> BaseResponse[CustomerResponse]:
    """Update customer details."""
    customer = await db.get(Customer, customer_id)
    if not customer:
        raise_not_found("Customer", str(customer_id))

    update_data = customer_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)

    await db.flush()
    await db.refresh(customer)

    return BaseResponse(
        message="Customer updated successfully",
        data=CustomerResponse.model_validate(customer),
    )


@router.delete("/{customer_id}", status_code=204)
async def delete_customer(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db_session),
) -> None:
    """Delete a customer."""
    customer = await db.get(Customer, customer_id)
    if not customer:
        raise_not_found("Customer", str(customer_id))

    await db.delete(customer)
