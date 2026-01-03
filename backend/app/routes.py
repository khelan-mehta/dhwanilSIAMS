from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .database import SessionLocal
from . import crud, schemas

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/products")
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, product)

@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    return crud.get_products(db)

@router.post("/purchases")
def purchase(purchase: schemas.PurchaseCreate, db: Session = Depends(get_db)):
    return crud.record_purchase(db, purchase)

@router.post("/sales")
def sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    return crud.record_sale(db, sale)

@router.get("/finance", response_model=schemas.FinancialSummary)
def finance(db: Session = Depends(get_db)):
    return crud.financial_summary(db)
