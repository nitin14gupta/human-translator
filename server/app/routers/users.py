from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        preferred_language=user.preferred_language
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    """Get current user information"""
    return current_user

@router.put("/me", response_model=schemas.User)
def update_user_me(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update the current user's information"""
    # Update user fields if provided
    if user_update.preferred_language is not None:
        current_user.preferred_language = user_update.preferred_language
    if user_update.is_traveler is not None:
        current_user.is_traveler = user_update.is_traveler
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me/language")
def get_user_language(current_user: models.User = Depends(auth.get_current_active_user)):
    """Get the current user's preferred language"""
    return {"preferred_language": current_user.preferred_language} 