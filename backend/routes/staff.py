from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import models
from database import get_db

router = APIRouter()

# ==========================================
# 1. PYDANTIC SCHEMAS (Data Validation)
# ==========================================

# Sales Schemas
class SaleItem(BaseModel):
    itemId: int
    quantity: int

class DailySalesPayload(BaseModel):
    sale_date: date
    items: List[SaleItem]
    logged_by: int

# Financial Schemas
class FinancialPayload(BaseModel):
    fin_date: date
    cash_amount: float
    credit_amount: float
    paytm_amount: float
    card_amount: float
    total_revenue: float
    logged_by: int

# Inventory Schemas
class InventoryItem(BaseModel):
    inv_item_id: int
    quantity_logged: float

class InventoryPayload(BaseModel):
    log_date: date
    items: List[InventoryItem]
    logged_by: int

# Complimentary Schemas
class ComplimentaryItem(BaseModel):
    itemId: int
    quantity: int

class ComplimentaryPayload(BaseModel):
    comp_date: date
    items: List[ComplimentaryItem]
    logged_by: int

# New Items Schemas
class MenuItemCreate(BaseModel):
    item_name: str
    price: float

class InventoryItemCreate(BaseModel):
    item_name: str
    unit: str


# ==========================================
# 2. API ROUTES (Endpoints)
# ==========================================

# API 1: Check Today's Status (Lock/Unlock Feature ke liye)
@router.get("/api/staff/status/{check_date}")
def check_daily_status(check_date: date, db: Session = Depends(get_db)):
    # TiDB me check karo ki kya is date ka data pehle se hai
    sales_exist = db.query(models.DailyItemSale).filter(models.DailyItemSale.sale_date == check_date).first() is not None
    financial_exist = db.query(models.DailyFinancials).filter(models.DailyFinancials.fin_date == check_date).first() is not None
    inventory_exist = db.query(models.DailyInventoryLog).filter(models.DailyInventoryLog.log_date == check_date).first() is not None

    return {
        "sales_filled": sales_exist,
        "financial_filled": financial_exist,
        "inventory_filled": inventory_exist
    }

# ==========================================
# DAILY SALES APIs
# ==========================================

@router.get("/api/staff/daily-sales/{sale_date}")
def get_daily_sales_by_date(sale_date: date, db: Session = Depends(get_db)):
    try:
        sales = db.query(models.DailyItemSale).filter(models.DailyItemSale.sale_date == sale_date).all()
        return [{"item_id": s.item_id, "quantity_sold": s.quantity_sold} for s in sales]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/staff/daily-sales")
def save_daily_sales(payload: DailySalesPayload, db: Session = Depends(get_db)):
    try:
        db.query(models.DailyItemSale).filter(models.DailyItemSale.sale_date == payload.sale_date).delete()

        for item in payload.items:
            new_sale = models.DailyItemSale(
                sale_date=payload.sale_date,
                item_id=item.itemId,
                quantity_sold=item.quantity,
                logged_by=payload.logged_by
            )
            db.add(new_sale)
        
        db.commit()
        return {"status": "success", "message": "Sales data successfully saved/updated!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# FINANCIAL ENTRY APIs
# ==========================================

@router.get("/api/staff/financial-entry/{fin_date}")
def get_financial_entry_by_date(fin_date: date, db: Session = Depends(get_db)):
    try:
        financial = db.query(models.DailyFinancials).filter(models.DailyFinancials.fin_date == fin_date).first()
        if financial:
            return {
                "cash_amount": financial.cash_amount,
                "credit_amount": financial.credit_amount,
                "paytm_amount": financial.paytm_amount,
                "card_amount": financial.card_amount,
                "total_revenue": financial.total_revenue
            }
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/staff/financial-entry")
def save_financials(payload: FinancialPayload, db: Session = Depends(get_db)):
    try:
        db.query(models.DailyFinancials).filter(models.DailyFinancials.fin_date == payload.fin_date).delete()

        new_financial = models.DailyFinancials(
            fin_date=payload.fin_date,
            cash_amount=payload.cash_amount,
            credit_amount=payload.credit_amount,
            paytm_amount=payload.paytm_amount,
            card_amount=payload.card_amount,
            total_revenue=payload.total_revenue,
            logged_by=payload.logged_by
        )
        db.add(new_financial)
        db.commit()
        return {"status": "success", "message": "Financial data successfully saved/updated!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# INVENTORY LOG APIs
# ==========================================

@router.get("/api/staff/inventory-log/{log_date}")
def get_inventory_log_by_date(log_date: date, db: Session = Depends(get_db)):
    try:
        logs = db.query(models.DailyInventoryLog).filter(models.DailyInventoryLog.log_date == log_date).all()
        return [{"inv_item_id": l.inv_item_id, "quantity_logged": l.quantity_logged} for l in logs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/staff/inventory-log")
def save_inventory(payload: InventoryPayload, db: Session = Depends(get_db)):
    try:
        db.query(models.DailyInventoryLog).filter(models.DailyInventoryLog.log_date == payload.log_date).delete()

        for item in payload.items:
            new_log = models.DailyInventoryLog(
                log_date=payload.log_date,
                inv_item_id=item.inv_item_id,
                quantity_logged=item.quantity_logged,
                logged_by=payload.logged_by
            )
            db.add(new_log)
        db.commit()
        return {"status": "success", "message": "Inventory data successfully saved/updated!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
# ==========================================
# COMPLIMENTARY ENTRY APIs
# ==========================================

@router.get("/api/staff/complimentary/{comp_date}")
def get_complimentary_by_date(comp_date: date, db: Session = Depends(get_db)):
    try:
        comp_sales = db.query(models.DailyComplimentarySale).filter(models.DailyComplimentarySale.sale_date == comp_date).all()
        return [{"item_id": c.item_id, "quantity_complimentary": c.quantity_complimentary} for c in comp_sales]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/staff/complimentary")
def save_complimentary_sales(payload: ComplimentaryPayload, db: Session = Depends(get_db)):
    try:
        db.query(models.DailyComplimentarySale).filter(models.DailyComplimentarySale.sale_date == payload.comp_date).delete()

        for item in payload.items:
            new_comp_sale = models.DailyComplimentarySale(
                sale_date=payload.comp_date,
                item_id=item.itemId,
                quantity_complimentary=item.quantity,
                logged_by=payload.logged_by
            )
            db.add(new_comp_sale)
        
        db.commit()
        return {"status": "success", "message": "Complimentary data successfully saved/updated!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
# ==========================================
# MENU & INVENTORY ITEMS APIs
# ==========================================

@router.get("/api/menu-items")
def get_menu_items(db: Session = Depends(get_db)):
    return db.query(models.MenuItem).filter(models.MenuItem.is_active == True).all()

@router.post("/api/menu-items")
def add_menu_item(item: MenuItemCreate, db: Session = Depends(get_db)):
    new_item = models.MenuItem(item_name=item.item_name, price=item.price)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"message": "New item added", "item": new_item}

@router.get("/api/inventory-items")
def get_inventory_items(db: Session = Depends(get_db)):
    return db.query(models.InventoryItem).all()

@router.post("/api/inventory-items")
def add_inventory_item(item: InventoryItemCreate, db: Session = Depends(get_db)):
    new_item = models.InventoryItem(item_name=item.item_name, unit=item.unit)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"message": "New inventory item added", "item": new_item}