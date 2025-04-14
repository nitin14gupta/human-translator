from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import secrets
import string
from extensions import db
import json

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
    full_name = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    hourly_rate = db.Column(db.Float, nullable=False)
    languages = db.Column(db.JSON, nullable=False)  # List of language objects
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def as_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'phone_number': self.phone_number,
            'hourly_rate': self.hourly_rate,
            'languages': self.languages,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class TravelerProfile(db.Model):
    __tablename__ = 'traveler_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    full_name = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    nationality = db.Column(db.String(100), nullable=False)
    languages_needed = db.Column(db.JSON, nullable=False)  # List of language objects
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def as_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'phone_number': self.phone_number,
            'nationality': self.nationality,
            'languages_needed': self.languages_needed,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
       