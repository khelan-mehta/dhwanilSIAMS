from sqlalchemy import Column, Integer, String, Float, Boolean, Date
from .database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    stock_qty = Column(Integer, default=0)
    cost_price = Column(Float, nullable=False)
    sell_price = Column(Float, nullable=False)


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True)
    supplier = Column(String, nullable=False)
    product_id = Column(Integer, nullable=False)
    qty = Column(Integer, nullable=False)
    purchase_price = Column(Float, nullable=False)
    date = Column(Date, nullable=False)


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True)
    customer = Column(String, nullable=False)
    product_id = Column(Integer, nullable=False)
    qty = Column(Integer, nullable=False)
    selling_price = Column(Float, nullable=False)
    paid = Column(Boolean, default=True)
    profit = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
