from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta, date
from typing import List, Optional
from . import models, schemas
from .auth import get_password_hash, verify_password


# ==================== USER OPERATIONS ====================
def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()


def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


# ==================== CATEGORY OPERATIONS ====================
def create_category(db: Session, category: schemas.CategoryCreate) -> models.Category:
    db_category = models.Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def get_categories(db: Session) -> List[models.Category]:
    return db.query(models.Category).all()


def get_category(db: Session, category_id: int) -> Optional[models.Category]:
    return db.query(models.Category).filter(models.Category.id == category_id).first()


# ==================== PRODUCT OPERATIONS ====================
def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    search: Optional[str] = None,
    sku: Optional[str] = None,
    category_id: Optional[int] = None,
    low_stock: bool = False
) -> List[models.Product]:
    query = db.query(models.Product)
    if active_only:
        query = query.filter(models.Product.is_active == True)
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
    if sku:
        query = query.filter(models.Product.sku.ilike(f"%{sku}%"))
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    if low_stock:
        query = query.filter(models.Product.stock_qty <= models.Product.min_stock_level)
    return query.offset(skip).limit(limit).all()


def get_product(db: Session, product_id: int) -> Optional[models.Product]:
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate) -> Optional[models.Product]:
    db_product = get_product(db, product_id)
    if db_product:
        update_data = product_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
    return db_product


def get_low_stock_products(db: Session) -> List[models.Product]:
    return db.query(models.Product).filter(
        models.Product.stock_qty <= models.Product.min_stock_level,
        models.Product.is_active == True
    ).all()


# ==================== SUPPLIER OPERATIONS ====================
def create_supplier(db: Session, supplier: schemas.SupplierCreate) -> models.Supplier:
    db_supplier = models.Supplier(**supplier.model_dump())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier


def get_suppliers(db: Session, skip: int = 0, limit: int = 100) -> List[models.Supplier]:
    return db.query(models.Supplier).filter(models.Supplier.is_active == True).offset(skip).limit(limit).all()


def get_supplier(db: Session, supplier_id: int) -> Optional[models.Supplier]:
    return db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()


def update_supplier(db: Session, supplier_id: int, supplier_update: schemas.SupplierUpdate) -> Optional[models.Supplier]:
    db_supplier = get_supplier(db, supplier_id)
    if db_supplier:
        update_data = supplier_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_supplier, key, value)
        db.commit()
        db.refresh(db_supplier)
    return db_supplier


# ==================== CUSTOMER OPERATIONS ====================
def create_customer(db: Session, customer: schemas.CustomerCreate) -> models.Customer:
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def get_customers(db: Session, skip: int = 0, limit: int = 100) -> List[models.Customer]:
    return db.query(models.Customer).filter(models.Customer.is_active == True).offset(skip).limit(limit).all()


def get_customer(db: Session, customer_id: int) -> Optional[models.Customer]:
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()


def update_customer(db: Session, customer_id: int, customer_update: schemas.CustomerUpdate) -> Optional[models.Customer]:
    db_customer = get_customer(db, customer_id)
    if db_customer:
        update_data = customer_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_customer, key, value)
        db.commit()
        db.refresh(db_customer)
    return db_customer


# ==================== PURCHASE OPERATIONS ====================
def record_purchase(db: Session, purchase: schemas.PurchaseCreate, user_id: int = None) -> models.Purchase:
    product = get_product(db, purchase.product_id)
    if not product:
        raise ValueError("Product not found")

    product.stock_qty += purchase.qty
    total_amount = purchase.qty * purchase.purchase_price

    db_purchase = models.Purchase(
        supplier_id=purchase.supplier_id,
        product_id=purchase.product_id,
        user_id=user_id,
        qty=purchase.qty,
        purchase_price=purchase.purchase_price,
        total_amount=total_amount,
        notes=purchase.notes,
        date=purchase.date
    )
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    return db_purchase


def get_purchases(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    supplier_id: Optional[int] = None,
    product_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[models.Purchase]:
    query = db.query(models.Purchase)
    if supplier_id:
        query = query.filter(models.Purchase.supplier_id == supplier_id)
    if product_id:
        query = query.filter(models.Purchase.product_id == product_id)
    if start_date:
        query = query.filter(models.Purchase.date >= start_date)
    if end_date:
        query = query.filter(models.Purchase.date <= end_date)
    return query.order_by(desc(models.Purchase.date)).offset(skip).limit(limit).all()


def get_purchase(db: Session, purchase_id: int) -> Optional[models.Purchase]:
    return db.query(models.Purchase).filter(models.Purchase.id == purchase_id).first()


# ==================== SALE OPERATIONS ====================
def record_sale(db: Session, sale: schemas.SaleCreate, user_id: int = None) -> models.Sale:
    product = get_product(db, sale.product_id)
    if not product:
        raise ValueError("Product not found")
    if product.stock_qty < sale.qty:
        raise ValueError(f"Insufficient stock. Available: {product.stock_qty}")

    product.stock_qty -= sale.qty
    total_amount = sale.qty * sale.selling_price
    profit = (sale.selling_price - product.cost_price) * sale.qty
    is_fully_paid = sale.paid_amount >= total_amount

    db_sale = models.Sale(
        customer_id=sale.customer_id,
        product_id=sale.product_id,
        user_id=user_id,
        qty=sale.qty,
        selling_price=sale.selling_price,
        total_amount=total_amount,
        paid_amount=sale.paid_amount,
        is_fully_paid=is_fully_paid,
        profit=profit,
        notes=sale.notes,
        date=sale.date
    )
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale


def get_sales(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    customer_id: Optional[int] = None,
    payment_status: Optional[str] = None
) -> List[models.Sale]:
    query = db.query(models.Sale)
    if start_date:
        query = query.filter(models.Sale.date >= start_date)
    if end_date:
        query = query.filter(models.Sale.date <= end_date)
    if customer_id:
        query = query.filter(models.Sale.customer_id == customer_id)
    if payment_status:
        if payment_status == "paid":
            query = query.filter(models.Sale.is_fully_paid == True)
        elif payment_status == "unpaid":
            query = query.filter(models.Sale.paid_amount == 0)
        elif payment_status == "partial":
            query = query.filter(
                models.Sale.paid_amount > 0,
                models.Sale.is_fully_paid == False
            )
    return query.order_by(desc(models.Sale.date)).offset(skip).limit(limit).all()


def get_sale(db: Session, sale_id: int) -> Optional[models.Sale]:
    return db.query(models.Sale).filter(models.Sale.id == sale_id).first()


def update_sale_payment(db: Session, sale_id: int, additional_payment: float) -> Optional[models.Sale]:
    sale = get_sale(db, sale_id)
    if sale:
        sale.paid_amount += additional_payment
        sale.is_fully_paid = sale.paid_amount >= sale.total_amount
        db.commit()
        db.refresh(sale)
    return sale


# ==================== PAYMENT OPERATIONS ====================
def record_payment(db: Session, payment: schemas.PaymentCreate) -> models.Payment:
    sale = get_sale(db, payment.sale_id)
    if not sale:
        raise ValueError("Sale not found")

    sale.paid_amount += payment.amount
    sale.is_fully_paid = sale.paid_amount >= sale.total_amount

    db_payment = models.Payment(**payment.model_dump())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def get_payments(db: Session, skip: int = 0, limit: int = 100) -> List[models.Payment]:
    return db.query(models.Payment).order_by(desc(models.Payment.date)).offset(skip).limit(limit).all()


def get_customer_payments(db: Session, customer_id: int) -> List[models.Payment]:
    return db.query(models.Payment).filter(models.Payment.customer_id == customer_id).order_by(desc(models.Payment.date)).all()


# ==================== ANALYTICS & REPORTING ====================
def financial_summary(db: Session) -> dict:
    sales = db.query(models.Sale).all()
    purchases = db.query(models.Purchase).all()
    products = db.query(models.Product).filter(models.Product.is_active == True).all()
    customers = db.query(models.Customer).filter(models.Customer.is_active == True).count()
    suppliers = db.query(models.Supplier).filter(models.Supplier.is_active == True).count()

    total_revenue = sum(s.total_amount for s in sales)
    total_expenses = sum(p.total_amount for p in purchases)
    outstanding = sum(s.total_amount - s.paid_amount for s in sales if not s.is_fully_paid)
    net_profit = sum(s.profit for s in sales)
    low_stock = len([p for p in products if p.stock_qty <= p.min_stock_level])

    return {
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "outstanding_receivables": outstanding,
        "net_profit": net_profit,
        "total_products": len(products),
        "low_stock_count": low_stock,
        "total_customers": customers,
        "total_suppliers": suppliers
    }


def get_customer_debts(db: Session) -> List[dict]:
    customers = db.query(models.Customer).filter(models.Customer.is_active == True).all()
    debts = []

    for customer in customers:
        unpaid_sales = db.query(models.Sale).filter(
            models.Sale.customer_id == customer.id,
            models.Sale.is_fully_paid == False
        ).all()

        if unpaid_sales:
            total_owed = sum(s.total_amount - s.paid_amount for s in unpaid_sales)
            last_sale = max(unpaid_sales, key=lambda x: x.date)
            debts.append({
                "customer_id": customer.id,
                "customer_name": customer.name,
                "customer_phone": customer.phone,
                "total_owed": total_owed,
                "sales_count": len(unpaid_sales),
                "last_sale_date": last_sale.date
            })

    return sorted(debts, key=lambda x: x["total_owed"], reverse=True)


def get_sales_trend(db: Session, days: int = 30) -> List[dict]:
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days)

    sales = db.query(models.Sale).filter(models.Sale.date >= start_date).all()

    daily_data = {}
    for sale in sales:
        date_str = sale.date.isoformat()
        if date_str not in daily_data:
            daily_data[date_str] = {"revenue": 0, "profit": 0, "sales_count": 0}
        daily_data[date_str]["revenue"] += sale.total_amount
        daily_data[date_str]["profit"] += sale.profit
        daily_data[date_str]["sales_count"] += 1

    return [
        {"date": date, **data}
        for date, data in sorted(daily_data.items())
    ]


def get_top_products(db: Session, limit: int = 5) -> List[dict]:
    products = db.query(models.Product).filter(models.Product.is_active == True).all()
    product_stats = []

    for product in products:
        sales = db.query(models.Sale).filter(models.Sale.product_id == product.id).all()
        if sales:
            total_sold = sum(s.qty for s in sales)
            revenue = sum(s.total_amount for s in sales)
            profit = sum(s.profit for s in sales)
            product_stats.append({
                "product_id": product.id,
                "product_name": product.name,
                "total_sold": total_sold,
                "revenue": revenue,
                "profit": profit
            })

    return sorted(product_stats, key=lambda x: x["revenue"], reverse=True)[:limit]


def get_dashboard_stats(db: Session) -> dict:
    financial = financial_summary(db)
    recent_sales = get_sales(db, limit=5)
    recent_purchases = get_purchases(db, limit=5)
    top_products = get_top_products(db)
    customer_debts = get_customer_debts(db)
    sales_trend = get_sales_trend(db)
    low_stock = get_low_stock_products(db)

    return {
        "financial": financial,
        "recent_sales": recent_sales,
        "recent_purchases": recent_purchases,
        "top_products": top_products,
        "customer_debts": customer_debts,
        "sales_trend": sales_trend,
        "low_stock_products": low_stock
    }


# ==================== ROLE-SPECIFIC DASHBOARD STATS ====================
def get_user_stats(db: Session) -> dict:
    """Get user statistics by role for admin dashboard"""
    users = db.query(models.User).all()
    return {
        "total_users": len(users),
        "admin_count": len([u for u in users if u.role == "admin"]),
        "manager_count": len([u for u in users if u.role == "manager"]),
        "staff_count": len([u for u in users if u.role == "staff"]),
        "active_users": len([u for u in users if u.is_active])
    }


def get_inventory_valuation(db: Session) -> dict:
    """Calculate inventory valuation for manager dashboard"""
    products = db.query(models.Product).filter(models.Product.is_active == True).all()
    total_cost_value = sum(p.stock_qty * p.cost_price for p in products)
    total_sell_value = sum(p.stock_qty * p.sell_price for p in products)
    return {
        "total_cost_value": total_cost_value,
        "total_sell_value": total_sell_value,
        "potential_profit": total_sell_value - total_cost_value
    }


def get_today_sales_summary(db: Session) -> dict:
    """Get today's sales summary for staff dashboard"""
    today = datetime.utcnow().date()
    today_sales = db.query(models.Sale).filter(models.Sale.date == today).all()
    return {
        "sales_count": len(today_sales),
        "total_amount": sum(s.total_amount for s in today_sales),
        "total_items": sum(s.qty for s in today_sales)
    }


def get_admin_dashboard(db: Session) -> dict:
    """Full dashboard for admin users - all data including user stats"""
    financial = financial_summary(db)
    recent_sales = get_sales(db, limit=5)
    recent_purchases = get_purchases(db, limit=5)
    top_products = get_top_products(db)
    customer_debts = get_customer_debts(db)
    sales_trend = get_sales_trend(db)
    low_stock = get_low_stock_products(db)
    user_stats = get_user_stats(db)

    return {
        "role": "admin",
        "financial": financial,
        "user_stats": user_stats,
        "recent_sales": recent_sales,
        "recent_purchases": recent_purchases,
        "top_products": top_products,
        "customer_debts": customer_debts,
        "sales_trend": sales_trend,
        "low_stock_products": low_stock
    }


def get_manager_dashboard(db: Session) -> dict:
    """Dashboard for manager users - sales & inventory focus, no user management"""
    sales_trend = get_sales_trend(db, days=30)
    top_products = get_top_products(db, limit=10)
    low_stock = get_low_stock_products(db)
    inventory = get_inventory_valuation(db)
    customer_debts = get_customer_debts(db)

    # Summary stats without full financial exposure
    sales = db.query(models.Sale).all()
    total_sales_count = len(sales)
    outstanding = sum(s.total_amount - s.paid_amount for s in sales if not s.is_fully_paid)

    return {
        "role": "manager",
        "summary": {
            "total_sales": total_sales_count,
            "outstanding_payments": outstanding,
            "low_stock_count": len(low_stock)
        },
        "inventory": inventory,
        "sales_trend": sales_trend,
        "top_products": top_products,
        "customer_debts": customer_debts,
        "low_stock_products": low_stock
    }


def get_staff_dashboard(db: Session) -> dict:
    """Minimal dashboard for staff users - only low stock and today's activity"""
    low_stock = get_low_stock_products(db)
    today_summary = get_today_sales_summary(db)

    # Get recent activity (last 5 sales made today)
    today = datetime.utcnow().date()
    recent_sales = db.query(models.Sale).filter(
        models.Sale.date == today
    ).order_by(desc(models.Sale.created_at)).limit(5).all()

    return {
        "role": "staff",
        "today_summary": today_summary,
        "low_stock_products": low_stock,
        "recent_activity": recent_sales
    }


# ==================== RETURNS OPERATIONS ====================
def get_total_returned_qty_for_sale(db: Session, sale_id: int) -> int:
    """Get total quantity already returned for a sale"""
    returns = db.query(models.SalesReturn).filter(models.SalesReturn.sale_id == sale_id).all()
    return sum(r.return_qty for r in returns)


def get_total_returned_qty_for_purchase(db: Session, purchase_id: int) -> int:
    """Get total quantity already returned for a purchase"""
    returns = db.query(models.PurchaseReturn).filter(models.PurchaseReturn.purchase_id == purchase_id).all()
    return sum(r.return_qty for r in returns)


def process_sales_return(
    db: Session,
    sale_id: int,
    return_data: schemas.SalesReturnCreate,
    user_id: int = None
) -> models.SalesReturn:
    """
    Process a sales return with stock rollback and financial adjustments.
    - Increases product stock
    - Calculates refund based on selling price
    - Adjusts profit (reduces by cost_price * return_qty)
    - For cash refund: reduces paid_amount
    - For credit: reduces outstanding (total_amount)
    """
    sale = get_sale(db, sale_id)
    if not sale:
        raise ValueError("Sale not found")

    # Validate return quantity
    already_returned = get_total_returned_qty_for_sale(db, sale_id)
    max_returnable = sale.qty - already_returned
    if return_data.return_qty > max_returnable:
        raise ValueError(f"Cannot return more than {max_returnable} items")

    # Get product for cost price calculation
    product = get_product(db, sale.product_id)
    if not product:
        raise ValueError("Product not found")

    # Calculate refund amount and profit adjustment
    refund_amount = return_data.return_qty * sale.selling_price
    profit_adjustment = -(return_data.return_qty * (sale.selling_price - product.cost_price))

    # Increase product stock
    product.stock_qty += return_data.return_qty

    # Adjust sale financials based on refund method
    if return_data.refund_method == "cash":
        # Cash refund: reduce paid amount
        sale.paid_amount = max(0, sale.paid_amount - refund_amount)
    else:
        # Credit: reduce total amount (customer credit)
        sale.total_amount -= refund_amount

    # Update fully paid status
    sale.is_fully_paid = sale.paid_amount >= sale.total_amount

    # Reduce profit
    sale.profit += profit_adjustment

    # Create return record
    db_return = models.SalesReturn(
        sale_id=sale_id,
        product_id=sale.product_id,
        user_id=user_id,
        return_qty=return_data.return_qty,
        refund_amount=refund_amount,
        refund_method=return_data.refund_method,
        profit_adjustment=profit_adjustment,
        reason=return_data.reason,
        return_date=return_data.return_date
    )
    db.add(db_return)
    db.commit()
    db.refresh(db_return)
    return db_return


def process_purchase_return(
    db: Session,
    purchase_id: int,
    return_data: schemas.PurchaseReturnCreate,
    user_id: int = None
) -> models.PurchaseReturn:
    """
    Process a purchase return to supplier with stock reduction.
    - Decreases product stock
    - Calculates refund based on purchase price
    - Tracks refund amount for expense adjustment
    """
    purchase = get_purchase(db, purchase_id)
    if not purchase:
        raise ValueError("Purchase not found")

    # Validate return quantity
    already_returned = get_total_returned_qty_for_purchase(db, purchase_id)
    max_returnable = purchase.qty - already_returned
    if return_data.return_qty > max_returnable:
        raise ValueError(f"Cannot return more than {max_returnable} items")

    # Get product
    product = get_product(db, purchase.product_id)
    if not product:
        raise ValueError("Product not found")

    # Validate stock availability
    if product.stock_qty < return_data.return_qty:
        raise ValueError(f"Insufficient stock. Only {product.stock_qty} available")

    # Calculate refund amount
    refund_amount = return_data.return_qty * purchase.purchase_price

    # Decrease product stock
    product.stock_qty -= return_data.return_qty

    # Adjust purchase total
    purchase.total_amount -= refund_amount

    # Create return record
    db_return = models.PurchaseReturn(
        purchase_id=purchase_id,
        product_id=purchase.product_id,
        user_id=user_id,
        return_qty=return_data.return_qty,
        refund_amount=refund_amount,
        refund_method=return_data.refund_method,
        reason=return_data.reason,
        return_date=return_data.return_date
    )
    db.add(db_return)
    db.commit()
    db.refresh(db_return)
    return db_return


def get_sales_returns(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[models.SalesReturn]:
    query = db.query(models.SalesReturn)
    if start_date:
        query = query.filter(models.SalesReturn.return_date >= start_date)
    if end_date:
        query = query.filter(models.SalesReturn.return_date <= end_date)
    return query.order_by(desc(models.SalesReturn.return_date)).offset(skip).limit(limit).all()


def get_purchase_returns(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[models.PurchaseReturn]:
    query = db.query(models.PurchaseReturn)
    if start_date:
        query = query.filter(models.PurchaseReturn.return_date >= start_date)
    if end_date:
        query = query.filter(models.PurchaseReturn.return_date <= end_date)
    return query.order_by(desc(models.PurchaseReturn.return_date)).offset(skip).limit(limit).all()


def get_sales_return(db: Session, return_id: int) -> Optional[models.SalesReturn]:
    return db.query(models.SalesReturn).filter(models.SalesReturn.id == return_id).first()


def get_purchase_return(db: Session, return_id: int) -> Optional[models.PurchaseReturn]:
    return db.query(models.PurchaseReturn).filter(models.PurchaseReturn.id == return_id).first()


def get_returns_for_sale(db: Session, sale_id: int) -> List[models.SalesReturn]:
    return db.query(models.SalesReturn).filter(models.SalesReturn.sale_id == sale_id).all()


def get_returns_for_purchase(db: Session, purchase_id: int) -> List[models.PurchaseReturn]:
    return db.query(models.PurchaseReturn).filter(models.PurchaseReturn.purchase_id == purchase_id).all()


def get_return_summary(db: Session) -> dict:
    """Get summary of all returns for reporting"""
    sales_returns = db.query(models.SalesReturn).all()
    purchase_returns = db.query(models.PurchaseReturn).all()

    return {
        "total_sales_returns": len(sales_returns),
        "total_purchase_returns": len(purchase_returns),
        "total_sales_refund_amount": sum(r.refund_amount for r in sales_returns),
        "total_purchase_refund_amount": sum(r.refund_amount for r in purchase_returns)
    }
