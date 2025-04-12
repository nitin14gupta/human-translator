import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.database import Base

class User(Base):
    """User model for authentication and user management"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    is_traveler = Column(Boolean, default=True)
    preferred_language = Column(String(10), default='en')
    profile_image = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    traveler_profile = relationship("TravelerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    translator_profile = relationship("TranslatorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")
    
    def __init__(self, name, email, password, is_traveler=True, preferred_language='en', profile_image=None):
        self.name = name
        self.email = email.lower()
        self.set_password(password)
        self.is_traveler = is_traveler
        self.preferred_language = preferred_language
        self.profile_image = profile_image
    
    def set_password(self, password):
        """Set password hash"""
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if password matches"""
        return check_password_hash(self.password, password)
    
    def to_dict(self):
        """Convert user to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'is_traveler': self.is_traveler,
            'preferred_language': self.preferred_language,
            'profile_image': self.profile_image,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class PasswordResetToken(Base):
    """Model for password reset tokens"""
    __tablename__ = 'password_reset_tokens'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    token = Column(String(255), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="reset_tokens")
    
    def __init__(self, user_id, token, expires_at):
        self.user_id = user_id
        self.token = token
        self.expires_at = expires_at
    
    def is_expired(self):
        """Check if token is expired"""
        return self.expires_at < datetime.datetime.utcnow() 