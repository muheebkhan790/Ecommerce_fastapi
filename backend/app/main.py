from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.account.routers import router as account_router
# pyrefly: ignore [missing-import]
from app.product.routers.category import router as category_router
from app.product.routers.product import router as products_router
from app.order.routers.order import router as orders_router

app = FastAPI(
    title="E-commerce API",
    description="E-commerce API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os

uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
if os.path.exists(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(account_router, prefix="/api/account", tags=["Account"])
app.include_router(category_router, prefix="/api/products-category", tags=["Product Category"])
app.include_router(products_router, prefix="/api/products", tags=["Products"])
app.include_router(orders_router, prefix="/api/orders", tags=["Orders"])