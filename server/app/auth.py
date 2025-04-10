from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from random import randint
from . import models, schemas
from .database import get_db
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get environment variables
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Function to generate a random 6-digit code
def generate_verification_code():
    return str(randint(100000, 999999))

# Create a verification code for a phone number
def create_verification_code(db: Session, phone_number: str):
    # Check if there's already a verification code for this phone number
    existing_code = db.query(models.VerificationCode).filter(
        models.VerificationCode.phone_number == phone_number,
        models.VerificationCode.expires_at > datetime.utcnow()
    ).first()
    
    if existing_code:
        # If a valid code exists, return it
        return existing_code
    
    # Create new verification code
    code = generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=10)  # Code expires in 10 minutes
    
    # Check if user exists for this phone number
    user = db.query(models.User).filter(models.User.phone_number == phone_number).first()
    
    # Create verification code object
    db_verification_code = models.VerificationCode(
        phone_number=phone_number,
        code=code,
        expires_at=expires_at,
        user_id=user.id if user else None
    )
    
    db.add(db_verification_code)
    db.commit()
    db.refresh(db_verification_code)
    
    return db_verification_code

# Verify a code and create/update user if successful
def verify_code(db: Session, phone_number: str, code: str, is_traveler: bool, preferred_language: str):
    # Find the verification code
    verification_code = db.query(models.VerificationCode).filter(
        models.VerificationCode.phone_number == phone_number,
        models.VerificationCode.code == code,
        models.VerificationCode.expires_at > datetime.utcnow(),
        models.VerificationCode.is_verified == False
    ).first()
    
    if not verification_code:
        return False
    
    # Mark code as verified
    verification_code.is_verified = True
    db.commit()
    
    # Find or create user
    user = db.query(models.User).filter(models.User.phone_number == phone_number).first()
    
    if user:
        # Update existing user
        user.is_traveler = is_traveler
        user.preferred_language = preferred_language
        user.is_active = True
    else:
        # Create new user
        user = models.User(
            phone_number=phone_number,
            is_traveler=is_traveler,
            preferred_language=preferred_language,
            is_active=True
        )
        db.add(user)
    
    db.commit()
    db.refresh(user)
    
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = schemas.TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: schemas.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user 