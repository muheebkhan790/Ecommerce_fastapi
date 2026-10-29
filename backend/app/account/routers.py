from fastapi import APIRouter , HTTPException , status , Depends , Request
from app.account.schemas import PasswordChangeRequest , PasswordResetEmailRequest , PasswordResetRequest , UserCreate , UserOut , UserLogin
from fastapi.responses import JSONResponse
from app.database.config import AsyncSessionDep
from app.account.services import change_password , create_user , authenticate_user , email_verification_send , password_reset_email_send , verify_email_token , verify_password_reset_token
from app.account.utils import create_tokens , revoke_refresh_token , verify_refresh_token
from app.account.models import User
from app.account.deps import get_current_user , require_admin

router = APIRouter()

@router.post("/register" , response_model=UserOut)
async def register(session: AsyncSessionDep , user:UserCreate):
    return await create_user(session , user)

@router.post("/login")
async def login(session: AsyncSessionDep , user_login:UserLogin):
    user = await authenticate_user(session , user_login)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    tokens = await create_tokens(session, user)
    response = JSONResponse(content={"message": "Login successful" })
    response.set_cookie(
        "access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60*60*24*1
    )
    response.set_cookie(
        "refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60*60*24*7
    )
    return response

@router.get("/me" , response_model=UserOut)
async def me(user:User = Depends(get_current_user)):
    return user

@router.post("/refresh")
async def refresh_token(session: AsyncSessionDep , request:Request):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token found"
        )
    user = await verify_refresh_token(session , token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    tokens = await create_tokens(session , user)
    response = JSONResponse(content={"message": "Token refreshed successfully"})
    response.set_cookie(
        "access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60*60*24*1
    )
    response.set_cookie(
        "refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=60*60*24*7
    )
    return response

@router.post("/send-verification-email")
async def send_verification_email(user:User = Depends(get_current_user)):
    return await email_verification_send(user)
    


@router.get("/verify-email")
async def verify_email(session:AsyncSessionDep , token:str):
    return await verify_email_token(session , token)


@router.post("/change-password")
async def password_change(session:AsyncSessionDep , data:PasswordChangeRequest, user:User = Depends(get_current_user) ):
    result = await change_password(session , user , data)
    return result

@router.post("/send-password-reset-email")
async def send_password_reset_email(session:AsyncSessionDep , data:PasswordResetEmailRequest):
    return await password_reset_email_send(session , data)

@router.post("/verify-password-reset-token")
async def verify_password_reset_tokens(session:AsyncSessionDep , data:PasswordResetRequest):
    return await verify_password_reset_token(session , data)

@router.get("/admin")
async def admin(user:User = Depends(require_admin)):
    return {"message" : f"You are admin {user.email}"}

@router.post("/logout")
async def logout(session:AsyncSessionDep , request:Request):
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        await revoke_refresh_token(session , refresh_token)
    response = JSONResponse(content={"message" : "Logout successful"})
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response
    

