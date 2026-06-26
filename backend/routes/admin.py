from fastapi import APIRouter, Depends, HTTPException ,Query
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel
import models
from database import get_db
from sqlalchemy import text
from datetime import date
from typing import Optional
import random



router = APIRouter()

# Password Hashing Setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

# Pydantic Schema
class UserCreate(BaseModel):
    username: str
    password: str
    role: str

# API Endpoint: Naya User Banane Ke Liye
@router.post("/api/users/create")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    hashed_pwd = get_password_hash(user.password)
    
    new_user = models.User(
        username=user.username,
        password_hash=hashed_pwd,
        role=user.role
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"status": "success", "message": f"{user.role} created!", "user_id": new_user.user_id}
    except Exception as e:
        db.rollback()
        print("ERROR:", str(e))
        raise HTTPException(
            status_code=400,
            detail=str(e)
    )
        
# 📊 Admin Dashboard Stats API
@router.get("/api/admin/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    try:
        # 1. Yesterday's Sales
        y_sales_query = text("SELECT SUM(total_revenue) FROM daily_financials WHERE fin_date = CURDATE() - INTERVAL 1 DAY")
        y_sales_res = db.execute(y_sales_query).scalar()
        yesterday_sales = float(y_sales_res) if y_sales_res else 0

        # 2. Highest Sale Date Last Week
        high_sale_query = text("SELECT DATE_FORMAT(fin_date, '%d-%b-%Y') as date, total_revenue as amount FROM daily_financials WHERE fin_date >= CURDATE() - INTERVAL 7 DAY ORDER BY total_revenue DESC LIMIT 1")
        high_sale_res = db.execute(high_sale_query).fetchone()
        highest_sale = {"date": high_sale_res.date, "amount": float(high_sale_res.amount)} if high_sale_res else {"date": "No Data", "amount": 0}

        # Helper function for Top Items
        def get_top_item(interval_condition):
            q = text(f"""
                SELECT m.item_name, SUM(d.quantity_sold) as qty
                FROM daily_item_sales d
                JOIN menu_items m ON d.item_id = m.item_id
                WHERE {interval_condition}
                GROUP BY m.item_name
                ORDER BY qty DESC LIMIT 1
            """)
            res = db.execute(q).fetchone()
            return {"name": res.item_name, "qty": int(res.qty)} if res else {"name": "No Data", "qty": 0}

        top_item_yesterday = get_top_item("d.sale_date = CURDATE() - INTERVAL 1 DAY")
        top_item_last_week = get_top_item("d.sale_date >= CURDATE() - INTERVAL 7 DAY")
        top_item_this_month = get_top_item("d.sale_date >= DATE_FORMAT(CURDATE() ,'%Y-%m-01')")

        # Helper function for Top Inventory
        def get_top_inventory(interval_condition):
            q = text(f"""
                SELECT i.item_name, i.unit, SUM(d.quantity_logged) as qty
                FROM daily_inventory_logs d
                JOIN inventory_items i ON d.inv_item_id = i.inv_item_id
                WHERE {interval_condition}
                GROUP BY i.inv_item_id
                ORDER BY qty DESC LIMIT 1
            """)
            res = db.execute(q).fetchone()
            return {"name": f"{res.item_name} ({res.unit})", "qty": float(res.qty)} if res else {"name": "No Data", "qty": 0}

        top_inv_last_week = get_top_inventory("d.log_date >= CURDATE() - INTERVAL 7 DAY")
        top_inv_this_month = get_top_inventory("d.log_date >= DATE_FORMAT(CURDATE() ,'%Y-%m-01')")

        # 3. Weekly Revenue Chart (Last 7 Days)
        weekly_rev_q = text("""
            SELECT DATE_FORMAT(fin_date, '%a') as date, total_revenue as Revenue
            FROM daily_financials
            WHERE fin_date >= CURDATE() - INTERVAL 7 DAY
            ORDER BY fin_date ASC
        """)
        weekly_chart = [{"date": row.date, "Revenue": float(row.Revenue)} for row in db.execute(weekly_rev_q).fetchall()]

        # 4. Payment Breakdown (Last 7 days - Weekly)
        pay_q = text("""
            SELECT SUM(paytm_amount) as paytm, SUM(cash_amount) as cash, SUM(card_amount) as card, SUM(credit_amount) as credit
            FROM daily_financials
            WHERE fin_date >= CURDATE() - INTERVAL 7 DAY
        """)
        pay_res = db.execute(pay_q).fetchone()
        payment_breakdown = [
            {"name": "PayTM / UPI", "value": float(pay_res.paytm or 0)},
            {"name": "Cash", "value": float(pay_res.cash or 0)},
            {"name": "Card", "value": float(pay_res.card or 0)},
            {"name": "Credit ", "value": float(pay_res.credit or 0)},
        ] if pay_res else []

        # 5. Yesterday's Detailed Sales List
        det_sales_q = text("""
            SELECT d.sale_id as id, m.item_name as name, d.quantity_sold as qty, (d.quantity_sold * m.price) as rev
            FROM daily_item_sales d
            JOIN menu_items m ON d.item_id = m.item_id
            WHERE d.sale_date = CURDATE() - INTERVAL 1 DAY
        """)
        yesterday_sales_list = [{"id": r.id, "name": r.name, "qty": r.qty, "rev": float(r.rev)} for r in db.execute(det_sales_q).fetchall()]

        # 6. Yesterday's Detailed Inventory List
        det_inv_q = text("""
            SELECT d.log_id as id, i.item_name as name, d.quantity_logged as val, i.unit as unit
            FROM daily_inventory_logs d
            JOIN inventory_items i ON d.inv_item_id = i.inv_item_id
            WHERE d.log_date = CURDATE() - INTERVAL 1 DAY
        """)
        yesterday_inv_list = [{"id": r.id, "name": r.name, "qty": f"{r.val} {r.unit}"} for r in db.execute(det_inv_q).fetchall()]

        # 🚀 Return All Data as JSON
        return {
            "yesterdaySales": yesterday_sales,
            "highestSaleDateLastWeek": highest_sale,
            "topItemYesterday": top_item_yesterday,
            "topItemLastWeek": top_item_last_week,
            "topItemThisMonth": top_item_this_month,
            "topInventoryLastWeek": top_inv_last_week,
            "topInventoryThisMonth": top_inv_this_month,
            "weeklyRevenueChart": weekly_chart,
            "paymentBreakdown": payment_breakdown,
            "yesterdayDetailedSales": yesterday_sales_list,
            "yesterdayDetailedInventory": yesterday_inv_list
        }
    except Exception as e:
        print("Error fetching stats:", str(e))
        return {"error": str(e)}


# 🕵️‍♂️ SMART DATE-RANGE STOCK TRACKER API (STRICT FILTER & FIXED SALES MATCHING)
@router.get("/api/admin/stock-tracker")
def get_stock_tracker(
    start_date: date = Query(...), 
    end_date: date = Query(...), 
    item_id: Optional[int] = Query(None), # Optional, if none it tracks all
    db: Session = Depends(get_db)
):
    try:
        # 🚫 STRICT FILTER: Excludes kg, gram, gm, g, liter, l, ml, and bread
        item_filter = """
            AND LOWER(i.unit) NOT LIKE '%kg%' 
            AND LOWER(i.unit) NOT LIKE '%gram%' 
            AND LOWER(i.unit) NOT LIKE '%gm%' 
            AND LOWER(i.unit) != 'g' 
            AND LOWER(i.unit) != 'l' 
            AND LOWER(i.unit) NOT LIKE '%liter%' 
            AND LOWER(i.unit) NOT LIKE '%ml%' 
            AND LOWER(i.item_name) NOT LIKE '%bread%'
        """
        
        # Base parameters for the SQL queries
        params = {
            "start": start_date, 
            "end": end_date
        }
        
        # If an item is selected from the dropdown, add it to the filter and params
        if item_id is not None:
            item_filter += " AND i.inv_item_id = :item_id"
            params['item_id'] = item_id 

        # 1. Fetch Restocks within Date Range (Arrived)
        restocks_query = text(f"""
            SELECT d.log_date as event_date, i.item_name, i.unit, SUM(d.quantity_logged) as qty 
            FROM daily_inventory_logs d
            JOIN inventory_items i ON d.inv_item_id = i.inv_item_id
            WHERE d.log_date >= :start AND d.log_date <= :end {item_filter}
            GROUP BY d.log_date, i.item_name, i.unit
        """)
        restocks = db.execute(restocks_query, params).fetchall()

        # 2. Fetch Sales within Date Range (Sold)
        sales_query = text(f"""
            SELECT s.sale_date as event_date, i.item_name, i.unit, m.price, SUM(s.quantity_sold) as qty 
            FROM daily_item_sales s
            JOIN menu_items m ON s.item_id = m.item_id
            JOIN inventory_items i ON (
                LOWER(m.item_name) LIKE CONCAT('%', LOWER(i.item_name), '%') 
                OR 
                LOWER(i.item_name) LIKE CONCAT('%', LOWER(m.item_name), '%')
            )
            WHERE s.sale_date >= :start AND s.sale_date <= :end {item_filter}
            GROUP BY s.sale_date, i.item_name, i.unit, m.price
        """)
        sales = db.execute(sales_query, params).fetchall()

        timeline_events = []
        total_arrived = 0
        total_sold = 0
        total_revenue = 0

        # Add Restock events
        for r in restocks:
            qty = float(r.qty)
            total_arrived += qty
            timeline_events.append({
                "date": str(r.event_date),
                "type": "restock",
                "title": f"📦 Stock Arrived: {r.item_name}",
                "itemName": r.item_name,
                "qty": qty,
                "unit": r.unit
            })

        # Add Sales events (With Randomized Payment Split)
        for s in sales:
            qty = int(s.qty)
            total_sold += qty
            revenue = qty * float(s.price)
            total_revenue += revenue
            
            paytm_qty = random.randint(0, qty)
            cash_qty = qty - paytm_qty
            
            timeline_events.append({
                "date": str(s.event_date),
                "type": "sale",
                "title": f"🛍️ Item Sold: {s.item_name}",
                "itemName": s.item_name,
                "qty": qty,
                "unit": s.unit,
                "revenue": revenue,
                "payments": {"paytm": paytm_qty, "cash": cash_qty}
            })

        # Combine and sort chronologically by date
        timeline_events.sort(key=lambda x: x["date"])
        
        # Determine Title
        report_name = "All Valid Items"
        unit_type = "Units"
        
        if item_id is not None:
            inv_obj = db.execute(text("SELECT item_name, unit FROM inventory_items WHERE inv_item_id = :id"), {"id": item_id}).fetchone()
            if inv_obj:
                report_name = inv_obj.item_name
                unit_type = inv_obj.unit

        return {
            "reportName": report_name,
            "unit": unit_type,
            "summary": {
                "totalArrived": total_arrived,
                "totalSold": total_sold,
                "balance": total_arrived - total_sold,
                "totalRevenue": total_revenue
            },
            "timeline": timeline_events
        }

    except Exception as e:
        print("Tracker Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))