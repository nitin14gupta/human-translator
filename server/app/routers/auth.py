from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import timedelta
from .. import models, schemas, auth
from ..database import get_db
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

router = APIRouter(
    tags=["authentication"]
)

# Function to simulate sending an SMS (in a real app, you would call an SMS service)
async def send_sms(phone_number: str, code: str):
    # In a production app, you would call a service like Twilio, etc.
    print(f"Sending code {code} to {phone_number}")
    # No need to do anything else in development

@router.post("/send-verification-code", response_model=schemas.VerificationCodeBase)
async def send_verification_code(
    background_tasks: BackgroundTasks,
    phone_data: schemas.VerificationCodeCreate,
    db: Session = Depends(get_db)
):
    """Send a verification code to the provided phone number"""
    # Create or get existing verification code
    verification_code = auth.create_verification_code(db, phone_data.phone_number)
    
    # Print the code directly for testing (REMOVE IN PRODUCTION)
    print(f"VERIFICATION CODE for {phone_data.phone_number}: {verification_code.code}")
    
    # Send the SMS (in background)
    background_tasks.add_task(send_sms, phone_data.phone_number, verification_code.code)
    
    # Return just the phone number (don't expose the code in response)
    return {"phone_number": phone_data.phone_number}

@router.post("/verify-code", response_model=schemas.Token)
async def verify_code(
    verification_data: schemas.VerificationCodeVerify,
    db: Session = Depends(get_db)
):
    """Verify a code and create or update user if successful"""
    user = auth.verify_code(
        db, 
        verification_data.phone_number, 
        verification_data.code,
        verification_data.is_traveler,
        verification_data.preferred_language
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": user.id,
        "is_traveler": user.is_traveler
    } 