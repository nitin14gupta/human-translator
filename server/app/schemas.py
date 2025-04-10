from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    phone_number: str
    preferred_language: Optional[str] = "en"
    is_traveler: bool = True

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    preferred_language: Optional[str] = None
    is_traveler: Optional[bool] = None

class UserInDB(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class User(UserInDB):
    pass

# Profile schemas
class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    preferred_language: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileInDB(ProfileBase):
    id: int
    user_id: int
    
    class Config:
        orm_mode = True

class Profile(ProfileInDB):
    pass

# Verification Code schemas
class VerificationCodeBase(BaseModel):
    phone_number: str

class VerificationCodeCreate(VerificationCodeBase):
    pass

class VerificationCodeVerify(BaseModel):
    phone_number: str
    code: str
    is_traveler: bool = True
    preferred_language: str = "en"

class VerificationCodeInDB(VerificationCodeBase):
    id: int
    code: str
    is_verified: bool
    created_at: datetime
    expires_at: datetime
    
    class Config:
        orm_mode = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    is_traveler: bool

class TokenData(BaseModel):
    user_id: Optional[int] = None 