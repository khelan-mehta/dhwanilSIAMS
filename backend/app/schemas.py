from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional, List
from .models import UserRole


# ==================== AUTH SCHEMAS ====================
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = UserRole.STAFF


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ==================== CATEGORY SCHEMAS ====================
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== PRODUCT SCHEMAS ====================
class ProductCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    stock_qty: int = 0
    min_stock_level: int = 10
    cost_price: float
    sell_price: float


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    stock_qty: Optional[int] = None
    min_stock_level: Optional[int] = None
    cost_price: Optional[float] = None
    sell_price: Optional[float] = None
    is_active: Optional[bool] = None


class ProductOut(BaseModel):
    id: int
    name: str
    sku: Optional[str]
    description: Optional[str]
    category_id: Optional[int]
    stock_qty: int
    min_stock_level: int
    cost_price: float
    sell_price: float
    is_active: bool
    created_at: datetime
    category: Optional[CategoryOut] = None

    class Config:
        from_attributes = True


# ==================== SUPPLIER SCHEMAS ====================
class SupplierCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class SupplierOut(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    notes: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== CUSTOMER SCHEMAS ====================
class CustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class CustomerOut(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    notes: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== PURCHASE SCHEMAS ====================
class PurchaseCreate(BaseModel):
    supplier_id: int
    product_id: int
    qty: int
    purchase_price: float
    notes: Optional[str] = None
    date: date


class PurchaseOut(BaseModel):
    id: int
    supplier_id: int
    product_id: int
    user_id: Optional[int]
    qty: int
    purchase_price: float
    total_amount: float
    notes: Optional[str]
    date: date
    created_at: datetime
    supplier: Optional[SupplierOut] = None
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True


# ==================== SALE SCHEMAS ====================
class SaleCreate(BaseModel):
    customer_id: int
    product_id: int
    qty: int
    selling_price: float
    paid_amount: float = 0
    notes: Optional[str] = None
    date: date


class SaleUpdate(BaseModel):
    paid_amount: Optional[float] = None
    notes: Optional[str] = None


class SaleOut(BaseModel):
    id: int
    customer_id: int
    product_id: int
    user_id: Optional[int]
    qty: int
    selling_price: float
    total_amount: float
    paid_amount: float
    is_fully_paid: bool
    profit: float
    notes: Optional[str]
    date: date
    created_at: datetime
    customer: Optional[CustomerOut] = None
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True


# ==================== PAYMENT SCHEMAS ====================
class PaymentCreate(BaseModel):
    sale_id: int
    customer_id: int
    amount: float
    payment_method: str = "cash"
    notes: Optional[str] = None
    date: date


class PaymentOut(BaseModel):
    id: int
    sale_id: int
    customer_id: int
    amount: float
    payment_method: str
    notes: Optional[str]
    date: date
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== ANALYTICS SCHEMAS ====================
class FinancialSummary(BaseModel):
    total_revenue: float
    total_expenses: float
    outstanding_receivables: float
    net_profit: float
    total_products: int
    low_stock_count: int
    total_customers: int
    total_suppliers: int


class CustomerDebt(BaseModel):
    customer_id: int
    customer_name: str
    customer_phone: Optional[str]
    total_owed: float
    sales_count: int
    last_sale_date: Optional[date]


class SalesAnalytics(BaseModel):
    date: str
    revenue: float
    profit: float
    sales_count: int


class ProductAnalytics(BaseModel):
    product_id: int
    product_name: str
    total_sold: int
    revenue: float
    profit: float


class DashboardStats(BaseModel):
    financial: FinancialSummary
    recent_sales: List[SaleOut]
    recent_purchases: List[PurchaseOut]
    top_products: List[ProductAnalytics]
    customer_debts: List[CustomerDebt]
    sales_trend: List[SalesAnalytics]
    low_stock_products: List[ProductOut]
