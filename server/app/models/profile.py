import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from app.models.database import Base

class TravelerProfile(Base):
    """Model for traveler profiles"""
    __tablename__ = 'traveler_profiles'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    bio = Column(Text, nullable=True)
    nationality = Column(String(100), nullable=True)
    current_location = Column(String(255), nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    travel_preferences = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="traveler_profile")
    
    def __init__(self, user_id, bio=None, nationality=None, current_location=None, emergency_contact=None, travel_preferences=None):
        self.user_id = user_id
        self.bio = bio
        self.nationality = nationality
        self.current_location = current_location
        self.emergency_contact = emergency_contact
        self.travel_preferences = travel_preferences
    
    def to_dict(self):
        """Convert traveler profile to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bio': self.bio,
            'nationality': self.nationality,
            'current_location': self.current_location,
            'emergency_contact': self.emergency_contact,
            'travel_preferences': self.travel_preferences,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class TranslatorProfile(Base):
    """Model for translator profiles"""
    __tablename__ = 'translator_profiles'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    bio = Column(Text, nullable=True)
    hourly_rate = Column(Numeric(10, 2), default=0.0)
    is_available = Column(Boolean, default=True)
    years_of_experience = Column(Integer, default=0)
    rating = Column(Numeric(3, 2), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="translator_profile")
    languages = relationship("Language", back_populates="translator_profile", cascade="all, delete-orphan")
    
    def __init__(self, user_id, bio=None, hourly_rate=0.0, is_available=True, years_of_experience=0):
        self.user_id = user_id
        self.bio = bio
        self.hourly_rate = hourly_rate
        self.is_available = is_available
        self.years_of_experience = years_of_experience
    
    def to_dict(self):
        """Convert translator profile to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bio': self.bio,
            'hourly_rate': float(self.hourly_rate) if self.hourly_rate else 0.0,
            'is_available': self.is_available,
            'years_of_experience': self.years_of_experience,
            'rating': float(self.rating) if self.rating else None,
            'languages': [lang.to_dict() for lang in self.languages] if self.languages else [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Language(Base):
    """Model for languages associated with translator profiles"""
    __tablename__ = 'languages'
    
    id = Column(Integer, primary_key=True)
    translator_profile_id = Column(Integer, ForeignKey('translator_profiles.id', ondelete='CASCADE'))
    language_code = Column(String(10), nullable=False)
    proficiency_level = Column(String(20), default='intermediate')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    translator_profile = relationship("TranslatorProfile", back_populates="languages")
    
    def __init__(self, translator_profile_id, language_code, proficiency_level='intermediate'):
        self.translator_profile_id = translator_profile_id
        self.language_code = language_code
        self.proficiency_level = proficiency_level
    
    def to_dict(self):
        """Convert language to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'language_code': self.language_code,
            'proficiency_level': self.proficiency_level
        } 