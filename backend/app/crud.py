from sqlalchemy.orm import Session
from . import models

# ---------------- PRODUCTS ----------------
def create_product(db: Session, product):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_products(db: Session):
    return db.query(models.Product).all()

# ---------------- PURCHASES ----------------
def record_purchase(db: Session, purchase):
    product = db.query(models.Product).filter_by(id=purchase.product_id).first()

    product.stock_qty += purchase.qty

    db_purchase = models.Purchase(**purchase.dict())
    db.add(db_purchase)
    db.commit()
    return db_purchase

# ---------------- SALES ----------------
def record_sale(db: Session, sale):
    product = db.query(models.Product).filter_by(id=sale.product_id).first()

    product.stock_qty -= sale.qty

    profit = (sale.selling_price - product.cost_price) * sale.qty

    db_sale = models.Sale(
        customer=sale.customer,
        product_id=sale.product_id,
        qty=sale.qty,
        selling_price=sale.selling_price,
        paid=sale.paid,
        profit=profit,
        date=sale.date
    )

    db.add(db_sale)
    db.commit()
    return db_sale

# ---------------- FINANCIALS ----------------
def financial_summary(db: Session):
    sales = db.query(models.Sale).all()
    purchases = db.query(models.Purchase).all()

    total_revenue = sum(s.selling_price * s.qty for s in sales)
    total_expenses = sum(p.purchase_price * p.qty for p in purchases)
    outstanding = sum(s.selling_price * s.qty for s in sales if not s.paid)
    net_profit = total_revenue - total_expenses

    return {
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "outstanding_receivables": outstanding,
        "net_profit": net_profit
    }
