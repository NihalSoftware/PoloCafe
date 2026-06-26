# backend/routes/ai_bot.py
import os
import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from groq import Groq
from database import get_db

router = APIRouter()

# Groq Client Setup
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class ChatRequest(BaseModel):
    prompt: str

# Current year nikalna taaki AI ko bata sakein
current_year = datetime.datetime.now().year

# 🚀 ULTRA-STRICT DATABASE SCHEMA & RULES FOR AI
DB_SCHEMA = f"""
Database Tables:
1. menu_items (item_id, item_name, price, is_active)
2. inventory_items (inv_item_id, item_name, unit)
3. daily_item_sales (sale_id, sale_date, item_id, quantity_sold, logged_by)
4. daily_financials (fin_id, fin_date, cash_amount, credit_amount, paytm_amount, card_amount, total_revenue, logged_by)
5. daily_inventory_logs (log_id, log_date, inv_item_id, quantity_logged, logged_by)
6. daily_complimentary_sales (comp_sale_id, sale_date, item_id, quantity_complimentary, logged_by)

Instructions:
1. You are a smart data assistant for Polo Cafe. Respond with a JSON object ONLY.
2. "reply_message": A conversational response matching the exact language of the user.
3. "sql_query": A valid MySQL SELECT query. Leave empty if no database search is needed.
4. DATE HANDLING: The current year is {current_year}. If the user mentions a date but no year, default to {current_year}.

🚨 CRITICAL SQL RULES (YOU MUST FOLLOW THESE EXACTLY):

RULE 1 (INVENTORY DATA): 
If the user asks for inventory, stock, or what arrived, you MUST JOIN `daily_inventory_logs` (d) and `inventory_items` (i) ON d.inv_item_id = i.inv_item_id.
You MUST SELECT exactly these columns with Aliases, COMBINING Quantity and Unit using CONCAT: 
`SELECT d.log_date AS Date, i.item_name AS Item, CONCAT(SUM(d.quantity_logged), ' ', i.unit) AS Quantity`
You MUST GROUP BY: `d.log_date, i.item_name, i.unit`

RULE 2 (SALES DATA): 
If asked for sales or what sold, JOIN `daily_item_sales` (s) and `menu_items` (m).
REQUIRED SELECT: `SELECT s.sale_date AS Date, m.item_name AS Item, SUM(s.quantity_sold) AS Quantity_Sold`
GROUP BY: `s.sale_date, m.item_name`

RULE 3 (COMPLIMENTARY DATA): 
If asked for free, complimentary, or home consumption, JOIN `daily_complimentary_sales` (c) and `menu_items` (m).
REQUIRED SELECT: `SELECT c.sale_date AS Date, m.item_name AS Item, SUM(c.quantity_complimentary) AS Free_Quantity`
GROUP BY: `c.sale_date, m.item_name`

RULE 4 (SEARCHING): 
NEVER use `=`. Always use `LIKE '%keyword%'`. IF the user DOES NOT specify an item name, DO NOT use any WHERE clause for item names. JUST RETURN ALL ITEMS for the dates.

JSON Format Expected:
{{
    "reply_message": "Your conversational response here",
    "sql_query": "SELECT ..."
}}
"""

@router.post("/api/admin/chat")
def ai_chat_assistant(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # 1. Ask Groq to analyze prompt and return JSON
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": DB_SCHEMA},
                {"role": "user", "content": request.prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1, # Temperature kam kiya taaki AI strict SQL rules follow kare
            response_format={"type": "json_object"}
        )
        
        # 2. Extract and Parse JSON
        content = chat_completion.choices[0].message.content
        if not content:
            return {"type": "text", "content": "I apologize, but I did not receive a response from the AI. Please try again."}
            
        ai_response = json.loads(content)
        sql_query = ai_response.get("sql_query", "").strip()
        reply_message = ai_response.get("reply_message", "Here is the information you requested.")

        # 3. Agar SQL query nahi hai, toh bas text message return karo
        if not sql_query:
            return {"type": "text", "content": reply_message}

        # Security check: Only allow SELECT queries
        if not sql_query.upper().startswith("SELECT"):
            return {"type": "text", "content": "I am restricted to reading data (SELECT) only. Please ask a data retrieval question."}

        # 4. Execute the generated SQL Query on Database
        result = db.execute(text(sql_query))
        columns = result.keys()
        data = [dict(zip(columns, row)) for row in result.fetchall()]

        # 5. Return the data OR handle Empty Data cleanly
        if not data:
            return {
                "type": "text", 
                "content": f"{reply_message}\n\n⚠️ **No data found in the database for this specific request.**"
            }
            
        return {
            "type": "table",
            "content": reply_message,
            "sql_used": sql_query,
            "data": data
        }

    except Exception as e:
        print("Error:", str(e))
        return {"type": "text", "content": f"System Error: Unable to process the request. Details: {str(e)}"}