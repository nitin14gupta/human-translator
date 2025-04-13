from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import secrets
import string
from extensions import db

# Generate a random token
def generate_token(length=32):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    is_traveler = db.Column(db.Boolean, nullable=False)
    preferred_language = db.Column(db.String(10), nullable=False, default='en')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    password_reset_tokens = db.relationship('PasswordResetToken', backref='user', lazy=True, cascade='all, delete')
    refresh_tokens = db.relationship('RefreshToken', backref='user', lazy=True, cascade='all, delete')
    translator_profile = db.relationship('TranslatorProfile', backref='user', lazy=True, uselist=False, cascade='all, delete')
    traveler_profile = db.relationship('TravelerProfile', backref='user', lazy=True, uselist=False, cascade='all, delete')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def as_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'is_traveler': self.is_traveler,
            'preferred_language': self.preferred_language,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(255), nullable=False, unique=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    @classmethod
    def create_token(cls, user_id, expiration=3600):  # Default: 1 hour
        token = generate_token()
        expires_at = datetime.utcnow() + timedelta(seconds=expiration)
        
        # Delete any existing tokens for the user
        cls.query.filter_by(user_id=user_id).delete()
        
        # Create new token
        reset_token = cls(
            user_id=user_id,
            token=token,
            expires_at=expires_at
        )
        
        db.session.add(reset_token)
        db.session.commit()
        
        return token
    
    @classmethod
    def verify_token(cls, token):
        # Find token in database
        token_record = cls.query.filter_by(token=token).first()
        
        if not token_record:
            return None
        
        # Check if token is expired
        if token_record.expires_at < datetime.utcnow():
            db.session.delete(token_record)
            db.session.commit()
            return None
        
        return token_record.user_id

class RefreshToken(db.Model):
    __tablename__ = 'refresh_tokens'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(255), nullable=False, unique=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    @classmethod
    def create_token(cls, user_id, expiration=2592000):  # Default: 30 days
        token = generate_token()
        expires_at = datetime.utcnow() + timedelta(seconds=expiration)
        
        # Create new token
        refresh_token = cls(
            user_id=user_id,
            token=token,
            expires_at=expires_at
        )
        
        db.session.add(refresh_token)
        db.session.commit()
        
        return token

class TranslatorProfile(db.Model):
    __tablename__ = 'translator_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    bio = db.Column(db.Text)
    profile_picture = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    specialties = db.Column(db.String(255))
    hourly_rate = db.Column(db.Numeric(10, 2))
    is_available = db.Column(db.Boolean, nullable=False, default=True)
    experience_years = db.Column(db.Integer)
    education = db.Column(db.Text)
    certificates = db.Column(db.Text)
    emergency_contact = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    language_proficiencies = db.relationship('LanguageProficiency', backref='translator_profile', lazy=True, cascade='all, delete')
    
    def as_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bio': self.bio,
            'profile_picture': self.profile_picture,
            'phone_number': self.phone_number,
            'specialties': self.specialties,
            'hourly_rate': float(self.hourly_rate) if self.hourly_rate else None,
            'is_available': self.is_available,
            'experience_years': self.experience_years,
            'education': self.education,
            'certificates': self.certificates,
            'emergency_contact': self.emergency_contact,
            'language_proficiencies': [lp.as_dict() for lp in self.language_proficiencies],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class LanguageProficiency(db.Model):
    __tablename__ = 'language_proficiencies'
    
    id = db.Column(db.Integer, primary_key=True)
    translator_profile_id = db.Column(db.Integer, db.ForeignKey('translator_profiles.id'), nullable=False)
    language_code = db.Column(db.String(10), nullable=False)
    proficiency_level = db.Column(db.String(20), nullable=False)  # beginner, intermediate, advanced, native
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('translator_profile_id', 'language_code', name='unique_translator_language'),
    )
    
    def as_dict(self):
        return {
            'id': self.id,
            'translator_profile_id': self.translator_profile_id,
            'language_code': self.language_code,
            'proficiency_level': self.proficiency_level,
            'created_at': self.created_at.isoformat()
        }

class TravelerProfile(db.Model):
    __tablename__ = 'traveler_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    bio = db.Column(db.Text)
    profile_picture = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    nationality = db.Column(db.String(100))
    current_location = db.Column(db.String(255))
    emergency_contact = db.Column(db.String(255))
    travel_preferences = db.Column(db.Text)
    languages_needed = db.Column(db.String(255))
    dietary_restrictions = db.Column(db.String(255))
    medical_conditions = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def as_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bio': self.bio,
            'profile_picture': self.profile_picture,
            'phone_number': self.phone_number,
            'nationality': self.nationality,
            'current_location': self.current_location,
            'emergency_contact': self.emergency_contact,
            'travel_preferences': self.travel_preferences,
            'languages_needed': self.languages_needed,
            'dietary_restrictions': self.dietary_restrictions,
            'medical_conditions': self.medical_conditions,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 