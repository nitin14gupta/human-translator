from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import secrets
import string
from extensions import db
import json
from sqlalchemy.dialects.postgresql import JSON, ARRAY
from sqlalchemy import func

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
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    languages = db.Column(JSON, nullable=False)  # Array of {language_code, proficiency_level}
    hourly_rate = db.Column(db.Float, nullable=False)
    photo_url = db.Column(db.String(255))
    location = db.Column(db.String(255))
    bio = db.Column(db.Text)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Additional fields for enhanced profile
    education = db.Column(JSON)  # Array of {degree, institution, year}
    certificates = db.Column(JSON)  # Array of {name, issuer, year, verified}
    specializations = db.Column(ARRAY(db.String))  # Array of specialization areas
    years_of_experience = db.Column(db.Integer)
    social_media = db.Column(JSON)  # Object with social media links
    preferred_meeting_locations = db.Column(ARRAY(db.String))  # Preferred meeting spots
    availability_hours = db.Column(JSON)  # Weekly availability schedule
    
    # Relationships
    ratings_received = db.relationship(
        'Rating',
        primaryjoin='and_(TranslatorProfile.user_id==Rating.reviewee_id)',
        foreign_keys='Rating.reviewee_id',
        backref='translator_profile',
        lazy=True
    )
    bookings = db.relationship(
        'Booking',
        primaryjoin='and_(TranslatorProfile.user_id==Booking.translator_id)',
        foreign_keys='Booking.translator_id',
        backref='translator_profile',
        lazy=True
    )
    
    def calculate_profile_completion(self):
        """Calculate profile completion percentage"""
        fields = {
            'languages': 15,  # Essential
            'hourly_rate': 10,  # Essential
            'photo_url': 10,
            'location': 10,
            'bio': 10,
            'education': 10,
            'certificates': 10,
            'specializations': 5,
            'years_of_experience': 5,
            'social_media': 5,
            'preferred_meeting_locations': 5,
            'availability_hours': 5
        }
        
        completed = 0
        for field, weight in fields.items():
            value = getattr(self, field)
            if value:
                if isinstance(value, list) and len(value) > 0:
                    completed += weight
                elif isinstance(value, dict) and len(value) > 0:
                    completed += weight
                elif isinstance(value, (str, int, float)):
                    completed += weight
        
        return completed
    
    def as_dict(self):
        # Get average rating
        try:
            avg_rating = db.session.query(func.avg(Rating.rating)).filter(
                Rating.reviewee_id == self.user_id
            ).scalar() or 0
        except Exception as e:
            # Handle any exceptions when getting ratings
            print(f"Error getting ratings: {str(e)}")
            avg_rating = 0
        
        # Get total number of bookings - safely handle errors
        try:
            booking_count = Booking.query.filter(
                Booking.translator_id == self.user_id
            ).count()
        except Exception as e:
            # Handle any exceptions when counting bookings
            print(f"Error counting bookings: {str(e)}")
            booking_count = 0
        
        return {
            'id': self.user_id,
            'name': self.user.name,
            'languages': self.languages,
            'hourly_rate': self.hourly_rate,
            'photo_url': self.photo_url or '',
            'location': self.location or '',
            'bio': self.bio or '',
            'is_available': self.is_available,
            'rating': round(float(avg_rating), 1),
            'booking_count': booking_count,
            'education': self.education or [],
            'certificates': self.certificates or [],
            'specializations': self.specializations or [],
            'years_of_experience': self.years_of_experience or 0,
            'social_media': self.social_media or {},
            'preferred_meeting_locations': self.preferred_meeting_locations or [],
            'availability_hours': self.availability_hours or {},
            'profile_completion': self.calculate_profile_completion(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    @classmethod
    def search(cls, filters=None, page=1, per_page=10):
        query = cls.query.join(User, cls.user_id == User.id)
        
        if filters:
            if 'language' in filters:
                # Search in JSON array for language code
                query = query.filter(
                    cls.languages.contains([{'language_code': filters['language']}])
                )
            
            if 'location' in filters:
                query = query.filter(
                    cls.location.ilike(f"%{filters['location']}%")
                )
            
            if 'available' in filters and filters['available']:
                query = query.filter(cls.is_available == True)
            
            if 'min_rating' in filters:
                # Subquery to get translators with minimum rating
                min_rating = float(filters['min_rating'])
                rated_translators = db.session.query(
                    Rating.reviewee_id,
                    db.func.avg(Rating.rating).label('avg_rating')
                ).group_by(Rating.reviewee_id).having(
                    db.func.avg(Rating.rating) >= min_rating
                ).subquery()
                
                query = query.join(
                    rated_translators,
                    cls.user_id == rated_translators.c.reviewee_id
                )
        
        # Order by rating and availability
        query = query.order_by(cls.is_available.desc(), cls.hourly_rate.asc())
        
        # Execute paginated query
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'translators': [item.as_dict() for item in paginated.items],
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }

class TravelerProfile(db.Model):
    __tablename__ = 'traveler_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    full_name = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    photo_url = db.Column(db.String(255))
    bio = db.Column(db.Text)
    nationality = db.Column(db.String(100))
    languages_needed = db.Column(JSON, nullable=False)  # Languages they need help with
    current_location = db.Column(db.String(255))
    travel_preferences = db.Column(JSON)  # Travel style, preferences, etc.
    interests = db.Column(ARRAY(db.String))  # Areas of interest
    emergency_contact = db.Column(JSON)  # Emergency contact information
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def calculate_profile_completion(self):
        """Calculate profile completion percentage"""
        fields = {
            'photo_url': 15,
            'bio': 15,
            'nationality': 15,
            'languages_needed': 15,  # Essential
            'current_location': 10,
            'travel_preferences': 10,
            'interests': 10,
            'emergency_contact': 10
        }
        
        completed = 0
        for field, weight in fields.items():
            value = getattr(self, field)
            if value:
                if isinstance(value, list) and len(value) > 0:
                    completed += weight
                elif isinstance(value, dict) and len(value) > 0:
                    completed += weight
                elif isinstance(value, str):
                    completed += weight
        
        return completed
    
    def as_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'photo_url': self.photo_url or '',
            'bio': self.bio or '',
            'nationality': self.nationality or '',
            'languages_needed': self.languages_needed,
            'current_location': self.current_location or '',
            'travel_preferences': self.travel_preferences or {},
            'interests': self.interests or [],
            'emergency_contact': self.emergency_contact or {},
            'profile_completion': self.calculate_profile_completion(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Rating(db.Model):
    __tablename__ = 'ratings'
    
    id = db.Column(db.Integer, primary_key=True)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reviewee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, reviewer_id, reviewee_id, booking_id, rating, comment=None):
        self.reviewer_id = reviewer_id
        self.reviewee_id = reviewee_id
        self.booking_id = booking_id
        self.rating = rating
        self.comment = comment

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    traveler_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    translator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # pending, confirmed, completed, cancelled
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    duration_hours = db.Column(db.Integer, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    notes = db.Column(db.Text)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, traveler_id, translator_id, date, start_time, duration_hours, location, total_amount, notes=None):
        self.traveler_id = traveler_id
        self.translator_id = translator_id
        self.date = date
        self.start_time = start_time
        self.duration_hours = duration_hours
        self.location = location
        self.total_amount = total_amount
        self.notes = notes
        self.status = 'pending'