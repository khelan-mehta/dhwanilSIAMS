from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import timedelta, date
from typing import List, Optional
import io
import pandas as pd

from .database import get_db
from . import crud, schemas, models
from .auth import (
    create_access_token,
    get_current_user,
    get_current_active_user,
    require_admin,
    require_manager_or_admin
)
from .config import settings

router = APIRouter()


# ==================== AUTH ROUTES ====================
@router.post("/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@router.post("/auth/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.authenticate_user(db, user.email, user.password)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/auth/me", response_model=schemas.UserOut)
def get_current_user_info(current_user: models.User = Depends(get_current_active_user)):
    return current_user


@router.put("/auth/me", response_model=schemas.UserOut)
def update_current_user(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.update_user(db, current_user.id, user_update)


# ==================== USER MANAGEMENT (ADMIN) ====================
@router.get("/users", response_model=List[schemas.UserOut])
def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return crud.get_users(db, skip=skip, limit=limit)


@router.get("/users/{user_id}", response_model=schemas.UserOut)
def get_user(
    user_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = crud.update_user(db, user_id, user_update)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ==================== CATEGORY ROUTES ====================
@router.post("/categories", response_model=schemas.CategoryOut)
def create_category(
    category: schemas.CategoryCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.create_category(db, category)


@router.get("/categories", response_model=List[schemas.CategoryOut])
def get_categories(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_categories(db)


# ==================== PRODUCT ROUTES ====================
@router.post("/products", response_model=schemas.ProductOut)
def create_product(
    product: schemas.ProductCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.create_product(db, product)


@router.get("/products", response_model=List[schemas.ProductOut])
def get_products(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None, description="Search by product name"),
    sku: Optional[str] = Query(None, description="Search by SKU"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    low_stock: bool = Query(False, description="Filter low stock products only"),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_products(
        db, skip=skip, limit=limit,
        search=search, sku=sku, category_id=category_id, low_stock=low_stock
    )


@router.get("/products/{product_id}", response_model=schemas.ProductOut)
def get_product(
    product_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    product_update: schemas.ProductUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    product = crud.update_product(db, product_id, product_update)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/products/alerts/low-stock", response_model=List[schemas.ProductOut])
def get_low_stock(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_low_stock_products(db)


# ==================== SUPPLIER ROUTES ====================
@router.post("/suppliers", response_model=schemas.SupplierOut)
def create_supplier(
    supplier: schemas.SupplierCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.create_supplier(db, supplier)


@router.get("/suppliers", response_model=List[schemas.SupplierOut])
def get_suppliers(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_suppliers(db, skip=skip, limit=limit)


@router.get("/suppliers/{supplier_id}", response_model=schemas.SupplierOut)
def get_supplier(
    supplier_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    supplier = crud.get_supplier(db, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


@router.put("/suppliers/{supplier_id}", response_model=schemas.SupplierOut)
def update_supplier(
    supplier_id: int,
    supplier_update: schemas.SupplierUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    supplier = crud.update_supplier(db, supplier_id, supplier_update)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


# ==================== CUSTOMER ROUTES ====================
@router.post("/customers", response_model=schemas.CustomerOut)
def create_customer(
    customer: schemas.CustomerCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.create_customer(db, customer)


@router.get("/customers", response_model=List[schemas.CustomerOut])
def get_customers(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_customers(db, skip=skip, limit=limit)


@router.get("/customers/{customer_id}", response_model=schemas.CustomerOut)
def get_customer(
    customer_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    customer = crud.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/customers/{customer_id}", response_model=schemas.CustomerOut)
def update_customer(
    customer_id: int,
    customer_update: schemas.CustomerUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    customer = crud.update_customer(db, customer_id, customer_update)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


# ==================== PURCHASE ROUTES ====================
@router.post("/purchases", response_model=schemas.PurchaseOut)
def create_purchase(
    purchase: schemas.PurchaseCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        return crud.record_purchase(db, purchase, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/purchases", response_model=List[schemas.PurchaseOut])
def get_purchases(
    skip: int = 0,
    limit: int = 100,
    supplier_id: Optional[int] = Query(None, description="Filter by supplier ID"),
    product_id: Optional[int] = Query(None, description="Filter by product ID"),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_purchases(
        db, skip=skip, limit=limit,
        supplier_id=supplier_id, product_id=product_id,
        start_date=start_date, end_date=end_date
    )


@router.get("/purchases/{purchase_id}", response_model=schemas.PurchaseOut)
def get_purchase(
    purchase_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    purchase = crud.get_purchase(db, purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return purchase


# ==================== SALE ROUTES ====================
@router.post("/sales", response_model=schemas.SaleOut)
def create_sale(
    sale: schemas.SaleCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        return crud.record_sale(db, sale, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/sales", response_model=List[schemas.SaleOut])
def get_sales(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    payment_status: Optional[str] = Query(None, description="Filter by status: paid, unpaid, partial"),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_sales(
        db, skip=skip, limit=limit,
        start_date=start_date, end_date=end_date,
        customer_id=customer_id, payment_status=payment_status
    )


@router.get("/sales/{sale_id}", response_model=schemas.SaleOut)
def get_sale(
    sale_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    sale = crud.get_sale(db, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale


# ==================== PAYMENT ROUTES ====================
@router.post("/payments", response_model=schemas.PaymentOut)
def create_payment(
    payment: schemas.PaymentCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        return crud.record_payment(db, payment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/payments", response_model=List[schemas.PaymentOut])
def get_payments(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_payments(db, skip=skip, limit=limit)


# ==================== ANALYTICS ROUTES ====================
@router.get("/analytics/dashboard")
def get_dashboard(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Return role-specific dashboard data"""
    if current_user.role == "admin":
        return crud.get_admin_dashboard(db)
    elif current_user.role == "manager":
        return crud.get_manager_dashboard(db)
    else:  # staff
        return crud.get_staff_dashboard(db)


@router.get("/analytics/finance", response_model=schemas.FinancialSummary)
def get_finance(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.financial_summary(db)


@router.get("/analytics/debts", response_model=List[schemas.CustomerDebt])
def get_debts(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_customer_debts(db)


@router.get("/analytics/sales-trend", response_model=List[schemas.SalesAnalytics])
def get_sales_trend(
    days: int = 30,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_sales_trend(db, days=days)


@router.get("/analytics/top-products", response_model=List[schemas.ProductAnalytics])
def get_top_products(
    limit: int = 5,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_top_products(db, limit=limit)


# ==================== EXPORT ROUTES ====================
@router.get("/export/debts")
def export_debts(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    debts = crud.get_customer_debts(db)

    df = pd.DataFrame(debts)
    if not df.empty:
        df.columns = ["Customer ID", "Customer Name", "Phone", "Amount Owed", "Unpaid Sales", "Last Sale Date"]

    output = io.BytesIO()
    df.to_excel(output, index=False, sheet_name="Customer Debts")
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=customer_debts.xlsx"}
    )


@router.get("/export/sales")
def export_sales(
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    payment_status: Optional[str] = Query(None, description="Filter by status: paid, unpaid, partial"),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    sales = crud.get_sales(
        db, limit=10000,
        start_date=start_date, end_date=end_date,
        customer_id=customer_id, payment_status=payment_status
    )

    data = []
    for sale in sales:
        data.append({
            "ID": sale.id,
            "Date": sale.date,
            "Customer": sale.customer.name if sale.customer else "N/A",
            "Product": sale.product.name if sale.product else "N/A",
            "Quantity": sale.qty,
            "Unit Price": sale.selling_price,
            "Total": sale.total_amount,
            "Paid": sale.paid_amount,
            "Outstanding": sale.total_amount - sale.paid_amount,
            "Profit": sale.profit,
            "Status": "Paid" if sale.is_fully_paid else "Pending"
        })

    df = pd.DataFrame(data)
    output = io.BytesIO()
    df.to_excel(output, index=False, sheet_name="Sales Report")
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=sales_report.xlsx"}
    )


@router.get("/export/purchases")
def export_purchases(
    supplier_id: Optional[int] = Query(None, description="Filter by supplier ID"),
    product_id: Optional[int] = Query(None, description="Filter by product ID"),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    purchases = crud.get_purchases(
        db, limit=10000,
        supplier_id=supplier_id, product_id=product_id,
        start_date=start_date, end_date=end_date
    )

    data = []
    for purchase in purchases:
        data.append({
            "ID": purchase.id,
            "Date": purchase.date,
            "Supplier": purchase.supplier.name if purchase.supplier else "N/A",
            "Product": purchase.product.name if purchase.product else "N/A",
            "Quantity": purchase.qty,
            "Unit Price": purchase.purchase_price,
            "Total": purchase.total_amount
        })

    df = pd.DataFrame(data)
    output = io.BytesIO()
    df.to_excel(output, index=False, sheet_name="Purchases Report")
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=purchases_report.xlsx"}
    )


@router.get("/export/inventory")
def export_inventory(
    search: Optional[str] = Query(None, description="Search by product name"),
    sku: Optional[str] = Query(None, description="Search by SKU"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    low_stock: bool = Query(False, description="Filter low stock products only"),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    products = crud.get_products(
        db, limit=10000,
        search=search, sku=sku, category_id=category_id, low_stock=low_stock
    )

    data = []
    for product in products:
        data.append({
            "ID": product.id,
            "SKU": product.sku or "N/A",
            "Name": product.name,
            "Category": product.category.name if product.category else "N/A",
            "Stock Qty": product.stock_qty,
            "Min Stock Level": product.min_stock_level,
            "Cost Price": product.cost_price,
            "Sell Price": product.sell_price,
            "Stock Value": product.stock_qty * product.cost_price,
            "Status": "Low Stock" if product.stock_qty <= product.min_stock_level else "OK"
        })

    df = pd.DataFrame(data)
    output = io.BytesIO()
    df.to_excel(output, index=False, sheet_name="Inventory")
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=inventory.xlsx"}
    )


# ==================== RETURNS ROUTES ====================
@router.post("/sales/{sale_id}/return", response_model=schemas.SalesReturnOut)
def create_sales_return(
    sale_id: int,
    return_data: schemas.SalesReturnCreate,
    current_user: models.User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    """Process a sales return. Only Admin or Manager can create returns."""
    try:
        return crud.process_sales_return(db, sale_id, return_data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/purchases/{purchase_id}/return", response_model=schemas.PurchaseReturnOut)
def create_purchase_return(
    purchase_id: int,
    return_data: schemas.PurchaseReturnCreate,
    current_user: models.User = Depends(require_manager_or_admin),
    db: Session = Depends(get_db)
):
    """Process a purchase return to supplier. Only Admin or Manager can create returns."""
    try:
        return crud.process_purchase_return(db, purchase_id, return_data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/returns/sales", response_model=List[schemas.SalesReturnOut])
def get_sales_returns(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all sales returns. All authenticated users can view."""
    return crud.get_sales_returns(db, skip=skip, limit=limit, start_date=start_date, end_date=end_date)


@router.get("/returns/purchases", response_model=List[schemas.PurchaseReturnOut])
def get_purchase_returns(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all purchase returns. All authenticated users can view."""
    return crud.get_purchase_returns(db, skip=skip, limit=limit, start_date=start_date, end_date=end_date)


@router.get("/returns/summary", response_model=schemas.ReturnSummary)
def get_return_summary(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get returns summary for reporting."""
    return crud.get_return_summary(db)


@router.get("/sales/{sale_id}/returns", response_model=List[schemas.SalesReturnOut])
def get_returns_for_sale(
    sale_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all returns for a specific sale."""
    return crud.get_returns_for_sale(db, sale_id)


@router.get("/purchases/{purchase_id}/returns", response_model=List[schemas.PurchaseReturnOut])
def get_returns_for_purchase(
    purchase_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all returns for a specific purchase."""
    return crud.get_returns_for_purchase(db, purchase_id)


@router.get("/sales/{sale_id}/returnable-qty")
def get_returnable_qty_for_sale(
    sale_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get the maximum returnable quantity for a sale."""
    sale = crud.get_sale(db, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    already_returned = crud.get_total_returned_qty_for_sale(db, sale_id)
    return {
        "sale_id": sale_id,
        "original_qty": sale.qty,
        "already_returned": already_returned,
        "returnable_qty": sale.qty - already_returned
    }


@router.get("/purchases/{purchase_id}/returnable-qty")
def get_returnable_qty_for_purchase(
    purchase_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get the maximum returnable quantity for a purchase."""
    purchase = crud.get_purchase(db, purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    already_returned = crud.get_total_returned_qty_for_purchase(db, purchase_id)
    return {
        "purchase_id": purchase_id,
        "original_qty": purchase.qty,
        "already_returned": already_returned,
        "returnable_qty": purchase.qty - already_returned
    }


# ==================== ACCOUNTS ROUTES ====================
@router.get("/accounts", response_model=List[schemas.AccountOut])
def get_accounts(
    account_type: Optional[str] = Query(None, description="Filter by account type"),
    is_system: Optional[bool] = Query(None, description="Filter system accounts"),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all accounts with optional filters."""
    return crud.get_accounts(db, account_type=account_type, is_system=is_system, skip=skip, limit=limit)


@router.get("/accounts/summary", response_model=schemas.AccountsSummary)
def get_accounts_summary(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get summary of all account balances."""
    return crud.get_accounts_summary(db)


@router.get("/accounts/initialize")
def initialize_accounts(
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Initialize system accounts. Admin only."""
    crud.initialize_system_accounts(db)
    return {"message": "System accounts initialized"}


@router.get("/accounts/{account_id}", response_model=schemas.AccountOut)
def get_account(
    account_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific account by ID."""
    account = crud.get_account(db, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.get("/accounts/{account_id}/ledger", response_model=List[schemas.LedgerEntryOut])
def get_account_ledger(
    account_id: int,
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get ledger entries for a specific account."""
    account = crud.get_account(db, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return crud.get_ledger_entries(db, account_id=account_id, start_date=start_date, end_date=end_date, skip=skip, limit=limit)


@router.post("/accounts/transfer")
def process_transfer(
    transfer: schemas.AccountTransfer,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Process a manual transfer between accounts. Admin only."""
    try:
        from_acc, to_acc = crud.process_account_transfer(
            db, transfer.from_account_id, transfer.to_account_id,
            transfer.amount, transfer.narration, transfer.transfer_date,
            current_user.id
        )
        return {
            "message": "Transfer completed",
            "from_account": {"id": from_acc.id, "balance": from_acc.balance},
            "to_account": {"id": to_acc.id, "balance": to_acc.balance}
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== LEDGER ROUTES ====================
@router.get("/ledger", response_model=List[schemas.LedgerEntryOut])
def get_ledger(
    account_id: Optional[int] = Query(None, description="Filter by account ID"),
    transaction_type: Optional[str] = Query(None, description="Filter by transaction type"),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get global ledger entries with optional filters."""
    return crud.get_ledger_entries(
        db, account_id=account_id, transaction_type=transaction_type,
        start_date=start_date, end_date=end_date, skip=skip, limit=limit
    )


# ==================== STATEMENT ROUTES ====================
@router.get("/statements/customer/{customer_id}")
def get_customer_statement(
    customer_id: int,
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get customer account statement."""
    try:
        return crud.get_customer_statement(db, customer_id, start_date, end_date)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/statements/supplier/{supplier_id}")
def get_supplier_statement(
    supplier_id: int,
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get supplier account statement."""
    try:
        return crud.get_supplier_statement(db, supplier_id, start_date, end_date)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ==================== EXPORT RETURNS ====================
@router.get("/export/returns")
def export_returns(
    return_type: Optional[str] = Query(None, description="Filter by type: sales, purchases"),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Export returns to Excel."""
    data = []

    if return_type != "purchases":
        sales_returns = crud.get_sales_returns(db, start_date=start_date, end_date=end_date, limit=10000)
        for r in sales_returns:
            data.append({
                "Type": "Sales Return",
                "ID": r.id,
                "Return Date": r.return_date,
                "Original Transaction ID": r.sale_id,
                "Product": r.product.name if r.product else "N/A",
                "Customer/Supplier": r.customer.name if r.customer else "N/A",
                "Return Qty": r.return_qty,
                "Unit Price": r.unit_price_at_sale,
                "Refund Amount": r.refund_amount,
                "Refund Method": r.refund_method,
                "Profit Impact": r.profit_adjustment,
                "Reason": r.reason or ""
            })

    if return_type != "sales":
        purchase_returns = crud.get_purchase_returns(db, start_date=start_date, end_date=end_date, limit=10000)
        for r in purchase_returns:
            data.append({
                "Type": "Purchase Return",
                "ID": r.id,
                "Return Date": r.return_date,
                "Original Transaction ID": r.purchase_id,
                "Product": r.product.name if r.product else "N/A",
                "Customer/Supplier": r.supplier.name if r.supplier else "N/A",
                "Return Qty": r.return_qty,
                "Unit Price": r.unit_price_at_purchase,
                "Refund Amount": r.refund_amount,
                "Refund Method": r.refund_method,
                "Profit Impact": 0,
                "Reason": r.reason or ""
            })

    df = pd.DataFrame(data)
    output = io.BytesIO()
    df.to_excel(output, index=False, sheet_name="Returns Report")
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=returns_report.xlsx"}
    )
