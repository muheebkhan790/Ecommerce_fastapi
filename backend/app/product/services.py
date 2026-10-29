from app.product.utils import generate_unique_slug
from app.product.utils import save_upload_file
from fastapi import HTTPException, status, UploadFile
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.product.models import Product, Category, ProductImage
from app.product.schemas import CategoryCreate, CategoryOut, ProductCreate, ProductOut, ProductUpdate
from sqlalchemy.orm import selectinload


async def create_category(session: AsyncSession, category: CategoryCreate) -> CategoryOut:
    new_cat = Category(name=category.name)
    session.add(new_cat)
    await session.commit()
    await session.refresh(new_cat)
    return new_cat


async def get_all_category(session: AsyncSession) -> list[CategoryOut]:
    result = await session.execute(select(Category))
    categories = result.scalars().all()
    return categories


async def delete_category(session: AsyncSession, id: int) -> dict:
    result = await session.execute(select(Category).where(Category.id == id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    await session.delete(category)
    await session.commit()
    return {"message": "category successfully deleted"}


async def delete_product(session: AsyncSession, product: Product):
    await session.delete(product)
    await session.commit()


def build_product_out(p: Product) -> ProductOut:
    imgs: list[str] = []
    if p.image_url:
        imgs.append(p.image_url)
    if hasattr(p, "product_images") and p.product_images:
        for pi in p.product_images:
            if pi.image_url and pi.image_url not in imgs:
                imgs.append(pi.image_url)

    return ProductOut(
        id=p.id,
        title=p.title,
        description=p.description,
        slug=p.slug,
        price=p.price,
        stock_quantity=p.stock_quantity,
        categories=[CategoryOut.model_validate(c) for c in (p.categories or [])],
        image_url=p.image_url,
        images=imgs
    )


async def create_product(
    session: AsyncSession,
    data: ProductCreate,
    image_url: UploadFile | None = None,
    additional_images: list[UploadFile] | None = None
) -> ProductOut:
    if data.stock_quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock quantity cannot be negative"
        )

    # One image for product is mandatory
    if not image_url or not getattr(image_url, "filename", None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Primary product image is mandatory."
        )

    primary_image_path = await save_upload_file(image_url, "images")

    categories = []
    if data.category_ids:
        category_stmt = select(Category).where(
            Category.id.in_(data.category_ids)
        )
        result = await session.execute(category_stmt)
        categories = result.scalars().all()

        if len(categories) != len(set(data.category_ids)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more categories do not exist"
            )

    product_dict = data.model_dump(exclude={"category_ids"})
    product_dict["slug"] = await generate_unique_slug(
        session, product_dict["title"]
    )

    new_product = Product(
        **product_dict,
        image_url=primary_image_path,
        categories=categories
    )

    session.add(new_product)
    await session.flush()

    # Save primary image as ProductImage
    primary_pi = ProductImage(
        product_id=new_product.id,
        image_url=primary_image_path,
        is_primary=True
    )
    session.add(primary_pi)

    # Save optional additional images
    if additional_images:
        for add_img in additional_images:
            if add_img and getattr(add_img, "filename", None):
                add_path = await save_upload_file(add_img, "images")
                session.add(ProductImage(
                    product_id=new_product.id,
                    image_url=add_path,
                    is_primary=False
                ))

    await session.commit()

    # Reload the product with categories and product_images explicitly
    stmt = (
        select(Product)
        .options(
            selectinload(Product.categories),
            selectinload(Product.product_images)
        )
        .where(Product.id == new_product.id)
    )

    result = await session.execute(stmt)
    prod = result.scalar_one()
    return build_product_out(prod)


async def get_all_product(
    session: AsyncSession,
    category_names: list[str] | None = None,
    limit: int = 5,
    page: int = 1
) -> dict:
    stmt = (
        select(Product)
        .options(
            selectinload(Product.categories),
            selectinload(Product.product_images)
        )
    )
    if category_names:
        stmt = stmt.join(Product.categories).where(Category.name.in_(category_names)).distinct()

    count_stmt = stmt.with_only_columns(func.count(Product.id)).order_by(None)
    total = await session.scalar(count_stmt)

    stmt = stmt.order_by(Product.created_at.desc()).limit(limit).offset((page - 1) * limit)
    result = await session.execute(stmt)
    products = result.scalars().all()

    return {
        "total": total or 0,
        "page": page,
        "limit": limit,
        "items": [build_product_out(p) for p in products]
    }


async def get_product_by_slug(session: AsyncSession, slug: str) -> ProductOut | None:
    stmt = (
        select(Product)
        .options(
            selectinload(Product.categories),
            selectinload(Product.product_images)
        )
        .where(Product.slug == slug)
    )
    result = await session.execute(stmt)
    product = result.scalar_one_or_none()
    if not product:
        return None
    return build_product_out(product)


async def update_product_stock(
    session: AsyncSession,
    product: Product,
    stock_quantity: int
) -> ProductOut:
    if stock_quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock quantity cannot be negative"
        )
    product.stock_quantity = stock_quantity
    await session.commit()

    stmt = (
        select(Product)
        .options(
            selectinload(Product.categories),
            selectinload(Product.product_images)
        )
        .where(Product.id == product.id)
    )
    res = await session.execute(stmt)
    updated = res.scalar_one()
    return build_product_out(updated)
