from fastapi import Depends , HTTPException , status , Request
from sqlalchemy import select
from app.database.config import AsyncSessionDep
from app.account.models import User
from app.account.utils import decode_token

async def get_current_user(session:AsyncSessionDep , request:Request):
    token = request.cookies.get('access_token')
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token found"
        )
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    subject = payload.get("sub")

    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    stmt = select(User).where(User.id == user_id)
    result = await session.scalars(stmt)
    user = result.first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

async def require_admin(user: User = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform this action Admin access required"
        )
    return user


async def get_optional_current_user(session: AsyncSessionDep, request: Request) -> User | None:
    token = request.cookies.get('access_token')
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    subject = payload.get("sub")
    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        return None
    stmt = select(User).where(User.id == user_id)
    result = await session.scalars(stmt)
    return result.first()










