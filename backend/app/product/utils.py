from app.product.models import Product
from pydantic._internal._generate_schema import UNSUPPORTED_STANDALONE_FIELDINFO_ATTRIBUTES
from slugify import slugify
from pathlib import Path
from uuid import uuid4
from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def generate_slug(text:str) -> str:
    return slugify(text)

async def generate_unique_slug(
    session: AsyncSession,
    title: str
) -> str:
    base_slug = generate_slug(title)
    slug = base_slug
    counter = 2

    while True:
        stmt = select(Product.id).where(Product.slug == slug)
        result = await session.execute(stmt)

        if result.scalar_one_or_none() is None:
            return slug

        slug = f"{base_slug}-{counter}"
        counter += 1


async def save_upload_file(upload_file:UploadFile , sub_dir:str )->str:
    if not upload_file or not upload_file.filename:
        return None

    ext = Path(upload_file.filename).suffix
    filename = f"{uuid4().hex}{ext}"
    dir_path = UPLOAD_DIR / sub_dir
    file_path = dir_path / filename
    
    content = await upload_file.read()
    with file_path.open("wb") as f:
        f.write(content)
        
    return str(file_path)    
    

    