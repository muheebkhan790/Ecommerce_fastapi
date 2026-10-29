from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.account.deps import get_optional_current_user, require_admin
from app.account.models import User
from app.database.config import AsyncSessionDep
from app.order.schemas import OrderCreate, OrderOut, OrderStatusUpdate
from app.order.services import (
    create_order,
    get_all_orders,
    get_order_by_number,
    update_order_status,
    delete_order,
)

router = APIRouter()


@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def checkout_order(
    data: OrderCreate,
    session: AsyncSessionDep,
    user: User | None = Depends(get_optional_current_user),
):
    return await create_order(session=session, data=data, user=user)


@router.get("/list", response_model=list[OrderOut])
async def list_orders(
    session: AsyncSessionDep,
    admin_user: User = Depends(require_admin),
    limit: int = Query(default=50, ge=1, le=100),
    page: int = Query(default=1, ge=1),
):
    return await get_all_orders(session=session, limit=limit, page=page)


@router.get("/{order_number}", response_model=OrderOut)
async def order_details(
    order_number: str,
    session: AsyncSessionDep,
):
    order = await get_order_by_number(session=session, order_number=order_number)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order


@router.patch("/{order_number}/status", response_model=OrderOut)
async def set_order_status(
    order_number: str,
    payload: OrderStatusUpdate,
    session: AsyncSessionDep,
    admin_user: User = Depends(require_admin),
):
    order = await get_order_by_number(session=session, order_number=order_number)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return await update_order_status(session=session, order=order, new_status=payload.status)


@router.delete("/{order_number}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_order(
    order_number: str,
    session: AsyncSessionDep,
    admin_user: User = Depends(require_admin),
):
    order = await get_order_by_number(session=session, order_number=order_number)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    await delete_order(session=session, order=order)
    return None

