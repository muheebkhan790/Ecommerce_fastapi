from fastapi import APIRouter , HTTPException , Depends , status
from app.account.deps import require_admin
from app.account.models import User
from app.database.config import AsyncSessionDep
from app.product.schemas import CategoryCreate, CategoryOut
from app.product.services import create_category , get_all_category , delete_category


router = APIRouter()

@router.post("/" , response_model=CategoryOut,status_code=status.HTTP_201_CREATED)
async def category_create(session: AsyncSessionDep, category: CategoryCreate, admin_user: User = Depends(require_admin)):
    return await create_category(session,category) 

@router.get("/" , response_model=list[CategoryOut],status_code=status.HTTP_200_OK)
async def category_get(session:AsyncSessionDep):
    return await get_all_category(session)

@router.delete("/{id}")
async def category_delete(session:AsyncSessionDep , id:int , admin_user:User = Depends(require_admin)):
    result = await delete_category(session , id)
    return result