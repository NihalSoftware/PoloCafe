import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Apne alag-alag routes ko yahan import karein
from routes import admin, staff, auth ,ai_bot

app = FastAPI(title="Polo Cafe API")

# Frontend ko connect karne ke liye CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Abhi ke liye sab allow kar rahe hain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# APIs ko main app se link karna
app.include_router(admin.router, tags=["Admin"])
app.include_router(staff.router, tags=["Staff"])
app.include_router(auth.router, tags=["Authentication"])
app.include_router(ai_bot.router, tags=["AI Bot"])

@app.get("/")
def read_root():
    return {"message": "Polo Cafe Backend Server is Running!"}

# Server chalane ka direct code
if __name__ == "__main__":
    print("Starting Polo Cafe Server...")
    # Isse aap seedha 'python main.py' run karke server chala sakte hain
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)