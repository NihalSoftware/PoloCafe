# backend/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta
import models
from database import get_db

router = APIRouter()

# Password Hashing Setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Settings
SECRET_KEY = "polo_cafe_super_secret_key" # Ise baad me .env me daal denge
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

class LoginRequest(BaseModel):
    username: str
    password: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/api/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # 1. User ko database me dhundho
    user = db.query(models.User).filter(models.User.username == request.username).first()
    
    # 2. Check karo ki user hai aur password sahi hai ya nahi
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Galat Username ya Password")
    
    # 3. Token banao aur role ke sath bhejo
    access_token = create_access_token(data={"sub": user.username, "role": user.role, "id": user.user_id})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role,
        "username": user.username
    }