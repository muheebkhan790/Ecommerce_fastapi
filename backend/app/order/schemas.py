from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class OrderItemCreate(BaseModel):
    product_id: int | None = None
    product_title: str
    product_slug: str | None = None
    product_image_url: str | None = None
    price: float = Field(..., ge=0)
    quantity: int = Field(..., ge=1)


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=150)
    customer_email: EmailStr
    customer_phone: str = Field(..., min_length=5, max_length=50)
    shipping_address: str = Field(..., min_length=5)
    city: str = Field(..., min_length=2, max_length=100)
    postal_code: str | None = None
    country: str = Field(default="United States")
    order_notes: str | None = None
    payment_method: str = Field(default="cash_on_delivery")
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderItemOut(BaseModel):
    id: int
    product_id: int | None = None
    product_title: str
    product_slug: str | None = None
    product_image_url: str | None = None
    price: float
    quantity: int
    subtotal: float

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    order_number: str
    user_id: int | None = None
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    city: str
    postal_code: str | None = None
    country: str
    order_notes: str | None = None
    payment_method: str
    total_amount: float
    status: str
    created_at: datetime
    items: list[OrderItemOut]

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., min_length=2, max_length=50)

