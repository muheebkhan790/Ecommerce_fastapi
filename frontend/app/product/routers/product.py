from fastapi import Query, status, HTTPException
from typing import Annotated
from fastapi import APIRouter, Depends, UploadFile, File, Form
from app.account.models import User
from app.database.config import AsyncSessionDep
from app.product.schemas import (
    PaginatedProductOut,
    ProductCreate,
    ProductUpdate,
    ProductOut,
    StockUpdate
)
from app.account.deps import require_admin
from app.product.models import Product
from app.product.services import (
    create_product,
    get_all_product,
    get_product_by_slug,
    delete_product,
    update_product_stock
)
from sqlalchemy import select


router = APIRouter()


@router.post("/", response_model=ProductOut)
async def product_create(
    session: AsyncSessionDep,
    title: str = Form(...),
    description: str | None = Form(None),
    price: float = Form(...),
    stock_quantity: int = Form(...),
    category_ids: Annotated[list[int], Form()] = [],
    image_url: UploadFile = File(..., description="Primary image is mandatory"),
    additional_images: list[UploadFile] = File(default=[], description="Additional images (optional)"),
    admin_user: User = Depends(require_admin)
):
    data = ProductCreate(
        title=title,
        description=description,
        price=price,
        stock_quantity=stock_quantity,
        category_ids=category_ids,
    )
    return await create_product(
        session=session,
        data=data,
        image_url=image_url,
        additional_images=additional_images
    )


@router.get("/", response_model=PaginatedProductOut)
async def list_product(
    session: AsyncSessionDep,
    category_names: list[str] | None = Query(default=None),
    limit: int = Query(default=6, ge=1, le=100),
    page: int = Query(default=1, ge=1)
):
    return await get_all_product(session, category_names, limit, page)


@router.get("/{slug}", response_model=ProductOut)
async def product_by_slug(session: AsyncSessionDep, slug: str):
    product = await get_product_by_slug(session, slug)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.patch("/{slug}/stock", response_model=ProductOut)
async def update_stock(
    slug: str,
    payload: StockUpdate,
    session: AsyncSessionDep,
    admin_user: User = Depends(require_admin),
):
    stmt = select(Product).where(Product.slug == slug)
    res = await session.execute(stmt)
    product = res.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return await update_product_stock(session, product, payload.stock_quantity)


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def product_delete(
    slug: str,
    session: AsyncSessionDep,
    admin_user: User = Depends(require_admin),
):
    stmt = select(Product).where(Product.slug == slug)
    res = await session.execute(stmt)
    product = res.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    await delete_product(session, product)
    return None
