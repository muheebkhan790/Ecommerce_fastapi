import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.order.models import Order, OrderItem
from app.order.schemas import OrderCreate
from app.product.models import Product
from app.account.models import User
 # hello

def generate_order_number() -> str:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    unique_suffix = uuid.uuid4().hex[:6].upper()
    return f"ORD-{timestamp}-{unique_suffix}"


async def create_order(
    session: AsyncSession,
    data: OrderCreate,
    user: User | None = None
) -> Order:
    if not data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must have at least one item."
        )

    order_number = generate_order_number()
    total_amount = 0.0
    order_items: list[OrderItem] = []

    for item in data.items:
        subtotal = round(item.price * item.quantity, 2)
        total_amount += subtotal

        # Validate and decrement stock if product exists
        if item.product_id:
            stmt = select(Product).where(Product.id == item.product_id)
            res = await session.execute(stmt)
            prod = res.scalar_one_or_none()
            if prod:
                if prod.stock_quantity < item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Insufficient stock for '{prod.title}'. Only {prod.stock_quantity} available in stock."
                    )
                prod.stock_quantity -= item.quantity

        order_item = OrderItem(
            product_id=item.product_id,
            product_title=item.product_title,
            product_slug=item.product_slug,
            product_image_url=item.product_image_url,
            price=item.price,
            quantity=item.quantity,
            subtotal=subtotal
        )
        order_items.append(order_item)

    new_order = Order(
        order_number=order_number,
        user_id=user.id if user else None,
        customer_name=data.customer_name,
        customer_email=data.customer_email,
        customer_phone=data.customer_phone,
        shipping_address=data.shipping_address,
        city=data.city,
        postal_code=data.postal_code,
        country=data.country,
        order_notes=data.order_notes,
        payment_method=data.payment_method,
        total_amount=round(total_amount, 2),
        status="confirmed",
        items=order_items
    )

    session.add(new_order)
    await session.commit()

    # Re-fetch order with items loaded
    stmt = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == new_order.id)
    )
    result = await session.execute(stmt)
    return result.scalar_one()


async def get_order_by_number(session: AsyncSession, order_number: str) -> Order | None:
    stmt = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.order_number == order_number)
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def get_all_orders(session: AsyncSession, limit: int = 50, page: int = 1) -> list[Order]:
    stmt = (
        select(Order)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .limit(limit)
        .offset((page - 1) * limit)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def update_order_status(session: AsyncSession, order: Order, new_status: str) -> Order:
    valid_statuses = ["confirmed", "processing", "completed", "cancelled"]
    clean_status = new_status.strip().lower()
    if clean_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid order status '{new_status}'. Allowed: {', '.join(valid_statuses)}"
        )
    order.status = clean_status
    await session.commit()

    stmt = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order.id)
    )
    res = await session.execute(stmt)
    return res.scalar_one()


async def delete_order(session: AsyncSession, order: Order) -> None:
    # Admin can delete order that can be complete
    if order.status.strip().lower() != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only orders with status 'completed' can be deleted. Please mark the order as completed first."
        )
    await session.delete(order)
    await session.commit()
