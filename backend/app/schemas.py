from pydantic import BaseModel
from datetime import date

class ProductBase(BaseModel):
    name: str
    stock_qty: int
    cost_price: float
    sell_price: float

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    class Config:
        orm_mode = True


class PurchaseCreate(BaseModel):
    supplier: str
    product_id: int
    qty: int
    purchase_price: float
    date: date


class SaleCreate(BaseModel):
    customer: str
    product_id: int
    qty: int
    selling_price: float
    paid: bool
    date: date


class FinancialSummary(BaseModel):
    total_revenue: float
    total_expenses: float
    outstanding_receivables: float
    net_profit: float
