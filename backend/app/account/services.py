from app.account.models import User, RefreshToken
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException ,status
from app.account.schemas import PasswordChangeRequest , PasswordResetRequest , PasswordResetEmailRequest , UserCreate , UserLogin

from app.account.utils import create_email_verification_token ,create_password_reset_token , get_user_by_email , hash_password, verify_email_token_and_get_user_id , verify_password

async def create_user(session: AsyncSession , user: UserCreate):
    stmt=select(User).where(User.email == user.email)
    result = await session.scalars(stmt)
    if result.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST ,
            detail="User already exists"
        )
    new_user = User(
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user

async def authenticate_user(session: AsyncSession , user_login: UserLogin):
    stmt = select(User).where(User.email == user_login.email)
    result = await session.scalars(stmt)
    user = result.first()
    if not user or not verify_password(user_login.password , user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    return user
    
async def email_verification_send(user: User):
    token = create_email_verification_token(user.id)
    link = f"http://localhost:8000/account/verify?token={token}"
    print(f"Please Verify Your Email {link}")
    return {"message": "Verification email sent"}


async def verify_email_token(session: AsyncSession , token: str):
    user_id = verify_email_token_and_get_user_id(token , "email_verification")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    stmt = select(User).where(User.id == user_id)
    result = await session.scalars(stmt)
    user = result.first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    user.is_verified = True
    session.add(user)
    await session.commit()
    return {"message": "Email verified successfully"}

async def change_password(session: AsyncSession , user: User , data : PasswordChangeRequest):
    if not verify_password(data.old_password , user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid old password"
        )
    user.hashed_password = hash_password(data.new_password)
    session.add(user)
    await session.commit()
    return {"message": "Password changed successfully"}



async def password_reset_email_send(session: AsyncSession , data : PasswordResetEmailRequest):
    user = await get_user_by_email(session , data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    token = create_password_reset_token(user.id)
    link = f"http://localhost:8000/account/password-reset?token={token}"
    print(f"Please Verify Your Email {link}")
    return {"message": "Verification email sent"}
    
async def verify_password_reset_token(session: AsyncSession , data: PasswordResetRequest):
    user_id = verify_email_token_and_get_user_id(data.token , "password_reset")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    stmt = select(User).where(User.id == user_id)
    result = await session.scalars(stmt)
    user = result.first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    user.hashed_password = hash_password(data.new_password)
    session.add(user)
    await session.commit()
    return {"message": "Password reset successfully"}
    







