from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# 1. Users Table
class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(10), default="staff") # 'admin' ya 'staff'

# 2. Menu Items Table (Jo items cafe me bikte hain)
class MenuItem(Base):
    __tablename__ = "menu_items"
    item_id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)

# 3. Inventory Items Table (Ghar/Market se aane wala saman)
class InventoryItem(Base):
    __tablename__ = "inventory_items"
    inv_item_id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(100), nullable=False)
    unit = Column(String(20))

# 4. Daily Item Sales Log
class DailyItemSale(Base):
    __tablename__ = "daily_item_sales"
    sale_id = Column(Integer, primary_key=True, index=True)
    sale_date = Column(Date, nullable=False)
    item_id = Column(Integer, ForeignKey("menu_items.item_id"))
    quantity_sold = Column(Integer, nullable=False)
    logged_by = Column(Integer, ForeignKey("users.user_id"))

# 5. Daily Financials Log (Cash, UPI, etc.)
class DailyFinancials(Base):
    __tablename__ = "daily_financials"
    fin_id = Column(Integer, primary_key=True, index=True)
    fin_date = Column(Date, nullable=False, unique=True)
    cash_amount = Column(Float, default=0.0)
    credit_amount = Column(Float, default=0.0)
    paytm_amount = Column(Float, default=0.0)
    card_amount = Column(Float, default=0.0)
    total_revenue = Column(Float, default=0.0)
    logged_by = Column(Integer, ForeignKey("users.user_id"))

# 6. Daily Inventory Log (Kitna saman aaya/use hua)
class DailyInventoryLog(Base):
    __tablename__ = "daily_inventory_logs"
    log_id = Column(Integer, primary_key=True, index=True)
    log_date = Column(Date, nullable=False)
    inv_item_id = Column(Integer, ForeignKey("inventory_items.inv_item_id"))
    quantity_logged = Column(Float, nullable=False)
    logged_by = Column(Integer, ForeignKey("users.user_id"))
    
class DailyComplimentarySale(Base):
    __tablename__ = "daily_complimentary_sales"

    comp_sale_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sale_date = Column(Date, nullable=False)
    item_id = Column(Integer, ForeignKey("menu_items.item_id"), nullable=False)
    quantity_complimentary = Column(Integer, nullable=False)
    logged_by = Column(Integer, nullable=False)

