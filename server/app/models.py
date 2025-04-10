from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    is_traveler = Column(Boolean, default=True)  # True if user needs translator, False if user offers translation
    preferred_language = Column(String, default="en")  # Default language is English
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    profiles = relationship("Profile", back_populates="user")
    verification_codes = relationship("VerificationCode", back_populates="user")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    full_name = Column(String, index=True)
    bio = Column(String)
    avatar_url = Column(String)
    preferred_language = Column(String)  # This can also store language preference

    # Relationships
    user = relationship("User", back_populates="profiles")

class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    phone_number = Column(String, index=True)
    code = Column(String)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime)

    # Relationships
    user = relationship("User", back_populates="verification_codes") 