from click import echo
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from fastapi import Depends
from typing import AsyncGenerator, Annotated
from decouple import config


DATABASE_URL = config("DATABASE_URL") #f"postgresql+asyncpg://postgres:NewPassword123!@127.0.0.1:5432/ecommerce_db"

# Create async engine
engine = create_async_engine(DATABASE_URL)

# Create session
SessionLocal = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

AsyncSessionDep = Annotated[AsyncSession, Depends(get_session)]
