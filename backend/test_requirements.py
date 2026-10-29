import asyncio
import io
import httpx
from datetime import datetime, timezone
from app.database.config import SessionLocal
from app.account.models import User
from app.account.utils import create_access_token
from app.product.models import Product, ProductImage
from sqlalchemy import select, delete


BASE_URL = "http://127.0.0.1:8000"


async def setup_admin_token():
    async with SessionLocal() as session:
        res = await session.execute(select(User).where(User.is_admin == True))
        admin = res.scalars().first()
        if not admin:
            raise Exception("No admin user found in database.")
        token = create_access_token(data={"sub": str(admin.id)})
        return token, admin


async def run_tests():
    print("=" * 60)
    print("RUNNING COMPREHENSIVE TEST SUITE FOR E-COMMERCE REQUIREMENTS")
    print("=" * 60)

    admin_token, admin_user = await setup_admin_token()
    cookies = {"access_token": admin_token}

    async with httpx.AsyncClient(base_url=BASE_URL, cookies=cookies, timeout=20.0) as client:
        # -----------------------------------------------------------
        # TEST 1: Mandatory primary image & optional additional images
        # -----------------------------------------------------------
        print("\n[TEST 1] Product Creation - Mandatory vs Optional Images...")

        # 1a. Missing primary image must fail with 400
        res_fail = await client.post(
            "/api/products/",
            data={
                "title": "Test Missing Image Product",
                "description": "Should fail due to missing mandatory primary image",
                "price": "49.99",
                "stock_quantity": "5",
            }
        )
        assert res_fail.status_code in (400, 422), f"Expected 400/422 but got {res_fail.status_code}: {res_fail.text}"
        print("  ✓ Product creation without primary image correctly rejected (Mandatory requirement enforced).")

        # 1b. Providing 1 mandatory primary image + 2 optional additional images
        fake_primary = ("main.png", io.BytesIO(b"FAKE_PNG_PRIMARY_DATA"), "image/png")
        fake_opt1 = ("view1.png", io.BytesIO(b"FAKE_PNG_ADDITIONAL_1"), "image/png")
        fake_opt2 = ("view2.png", io.BytesIO(b"FAKE_PNG_ADDITIONAL_2"), "image/png")

        files = [
            ("image_url", fake_primary),
            ("additional_images", fake_opt1),
            ("additional_images", fake_opt2),
        ]
        data = {
            "title": f"Test Multi-Image Prod {datetime.now().strftime('%H%M%S')}",
            "description": "Product with 1 mandatory and 2 optional images",
            "price": "89.95",
            "stock_quantity": "10",
        }

        res_create = await client.post("/api/products/", data=data, files=files)
        assert res_create.status_code == 200, f"Create failed: {res_create.status_code} {res_create.text}"
        created_prod = res_create.json()
        assert created_prod["image_url"] is not None, "Primary image_url was not returned"
        assert len(created_prod.get("images", [])) >= 2, f"Expected multiple images, got {created_prod.get('images')}"
        prod_slug = created_prod["slug"]
        prod_id = created_prod["id"]
        print(f"  ✓ Product created successfully with primary image + {len(created_prod['images'])-1} optional images.")
        print(f"    Slug: {prod_slug}, Images: {created_prod['images']}")

        # -----------------------------------------------------------
        # TEST 2: Admin can update stock of present product
        # -----------------------------------------------------------
        print("\n[TEST 2] Admin Can Update Stock of Present Product...")

        # 2a. Update stock to 25
        res_stock = await client.patch(
            f"/api/products/{prod_slug}/stock",
            json={"stock_quantity": 25}
        )
        assert res_stock.status_code == 200, f"Stock update failed: {res_stock.status_code} {res_stock.text}"
        updated_prod = res_stock.json()
        assert updated_prod["stock_quantity"] == 25, f"Expected stock 25, got {updated_prod['stock_quantity']}"
        print(f"  ✓ Admin updated stock of '{prod_slug}' to 25.")

        # 2b. Negative stock must be rejected
        res_neg = await client.patch(
            f"/api/products/{prod_slug}/stock",
            json={"stock_quantity": -5}
        )
        assert res_neg.status_code in (400, 422), "Negative stock should be rejected"
        print("  ✓ Negative stock correctly rejected.")

        # 2c. Set stock to 2 for order test
        await client.patch(f"/api/products/{prod_slug}/stock", json={"stock_quantity": 2})
        print("  ✓ Stock adjusted to 2 for subsequent checkout tests.")

        # -----------------------------------------------------------
        # TEST 3: Catalog add more quantity than not in stock
        # -----------------------------------------------------------
        print("\n[TEST 3] Checkout / Order Stock Validation (Cannot exceed stock)...")

        # 3a. Placing order with quantity 5 when stock is 2 must fail
        over_order_payload = {
            "customer_name": "Test Customer",
            "customer_email": "customer@example.com",
            "customer_phone": "1234567890",
            "shipping_address": "123 Test St",
            "city": "Test City",
            "country": "United States",
            "payment_method": "cash_on_delivery",
            "items": [
                {
                    "product_id": prod_id,
                    "product_title": created_prod["title"],
                    "product_slug": prod_slug,
                    "price": 89.95,
                    "quantity": 5, # Exceeds available stock 2!
                }
            ]
        }

        res_over = await client.post("/api/orders/", json=over_order_payload)
        assert res_over.status_code == 400, f"Expected 400 Insufficient stock, got {res_over.status_code}: {res_over.text}"
        assert "Insufficient stock" in res_over.text or "Only 2" in res_over.text
        print("  ✓ Order exceeding available stock was properly rejected with HTTP 400 Insufficient stock.")

        # 3b. Placing order with valid quantity 2 must succeed and decrement stock to 0
        valid_order_payload = dict(over_order_payload)
        valid_order_payload["items"] = [
            {
                "product_id": prod_id,
                "product_title": created_prod["title"],
                "product_slug": prod_slug,
                "price": 89.95,
                "quantity": 2, # Exactly in stock
            }
        ]

        res_valid = await client.post("/api/orders/", json=valid_order_payload)
        assert res_valid.status_code == 201, f"Expected 201, got {res_valid.status_code}: {res_valid.text}"
        order_data = res_valid.json()
        order_num = order_data["order_number"]
        print(f"  ✓ Valid order placed successfully. Order Number: {order_num}")

        # Verify product stock is now 0
        res_after = await client.get(f"/api/products/{prod_slug}")
        assert res_after.json()["stock_quantity"] == 0, f"Stock should be 0, got {res_after.json()['stock_quantity']}"
        print("  ✓ Stock successfully decremented from 2 to 0.")

        # -----------------------------------------------------------
        # TEST 4: Admin can delete the order that can be complete
        # -----------------------------------------------------------
        print("\n[TEST 4] Admin Order Status Update and Completed Order Deletion...")

        # 4a. Attempt to delete order while status is 'confirmed' (must fail)
        res_del_fail = await client.delete(f"/api/orders/{order_num}")
        assert res_del_fail.status_code == 400, f"Expected 400, got {res_del_fail.status_code}: {res_del_fail.text}"
        print(f"  ✓ Deleting non-completed order '{order_num}' (status: confirmed) was rejected with HTTP 400.")

        # 4b. Admin updates status to 'completed'
        res_status = await client.patch(
            f"/api/orders/{order_num}/status",
            json={"status": "completed"}
        )
        assert res_status.status_code == 200, f"Status update failed: {res_status.status_code} {res_status.text}"
        assert res_status.json()["status"] == "completed"
        print(f"  ✓ Admin updated order '{order_num}' status to 'completed'.")

        # 4c. Now admin deletes the completed order (must succeed)
        res_del_ok = await client.delete(f"/api/orders/{order_num}")
        assert res_del_ok.status_code == 204, f"Delete completed order failed: {res_del_ok.status_code}"
        print(f"  ✓ Completed order '{order_num}' deleted successfully with HTTP 204 No Content.")

        # 4d. Verify order is deleted
        res_check = await client.get(f"/api/orders/{order_num}")
        assert res_check.status_code == 404, "Order should no longer exist"
        print(f"  ✓ Verified order '{order_num}' no longer exists in database.")

        # Clean up test product
        await client.delete(f"/api/products/{prod_slug}")
        print("  ✓ Cleaned up test product.")

    print("\n" + "=" * 60)
    print("ALL UNIT & INTEGRATION TESTS PASSED PERFECTLY!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_tests())
