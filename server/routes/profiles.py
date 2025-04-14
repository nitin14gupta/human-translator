from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from datetime import datetime
from extensions import db
from models import User, TranslatorProfile, TravelerProfile
import logging

profiles_bp = Blueprint('profiles', __name__)

@profiles_bp.route('/', methods=['POST'])
@jwt_required()
def create_profile():
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        
        if not user_id:
            return jsonify({'error': 'Invalid authentication token'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        logging.info(f"Creating profile for user {user_id} with data: {data}")
        
        try:
            if user.is_traveler:
                if user.traveler_profile:
                    return jsonify({'error': 'Traveler profile already exists'}), 400
                    
                required_fields = ['full_name', 'phone_number', 'nationality', 'languages_needed']
                if not all(field in data for field in required_fields):
                    return jsonify({'error': 'Missing required fields', 'required': required_fields}), 400
                    
                profile = TravelerProfile(
                    user_id=user_id,
                    full_name=data['full_name'],
                    phone_number=data['phone_number'],
                    nationality=data['nationality'],
                    languages_needed=data['languages_needed']
                )
            else:
                if user.translator_profile:
                    return jsonify({'error': 'Translator profile already exists'}), 400
                    
                required_fields = ['full_name', 'phone_number', 'hourly_rate', 'languages']
                if not all(field in data for field in required_fields):
                    return jsonify({'error': 'Missing required fields', 'required': required_fields}), 400
                    
                profile = TranslatorProfile(
                    user_id=user_id,
                    full_name=data['full_name'],
                    phone_number=data['phone_number'],
                    hourly_rate=float(data['hourly_rate']),
                    languages=data['languages']
                )
            
            db.session.add(profile)
            db.session.commit()
            
            logging.info(f"Successfully created profile for user {user_id}")
            return jsonify(profile.as_dict()), 201
            
        except Exception as e:
            db.session.rollback()
            logging.error(f"Error creating profile: {str(e)}")
            return jsonify({'error': str(e)}), 400
            
    except Exception as e:
        logging.error(f"Authentication error: {str(e)}")
        return jsonify({'error': 'Authentication failed'}), 401

@profiles_bp.route('/translator', methods=['POST'])
@jwt_required()
def create_translator_profile():
    try:
        user_id = get_jwt_identity()
        logging.info(f"Creating translator profile for user {user_id}")
        
        user = User.query.get(user_id)
        
        if not user:
            logging.error(f"User {user_id} not found")
            return jsonify({'error': 'User not found'}), 404
            
        if user.is_traveler:
            logging.error(f"User {user_id} is registered as a traveler")
            return jsonify({'error': 'User is registered as a traveler'}), 400
            
        if user.translator_profile:
            logging.error(f"Translator profile already exists for user {user_id}")
            return jsonify({'error': 'Translator profile already exists'}), 400
        
        data = request.get_json()
        logging.info(f"Received data: {data}")
        
        required_fields = ['full_name', 'phone_number', 'hourly_rate', 'languages']
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            logging.error(f"Missing required fields: {missing_fields}")
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400
        
        try:
            hourly_rate = float(data['hourly_rate'])
            
            # Validate languages array
            if not isinstance(data['languages'], list):
                logging.error("Languages must be a list")
                return jsonify({'error': 'Languages must be a list'}), 400
                
            if not data['languages']:
                logging.error("At least one language must be provided")
                return jsonify({'error': 'At least one language must be provided'}), 400
                
            for lang in data['languages']:
                if not isinstance(lang, dict):
                    logging.error("Each language must be an object")
                    return jsonify({'error': 'Each language must be an object'}), 400
                    
                if 'language_code' not in lang or 'language_name' not in lang:
                    logging.error("Each language must have language_code and language_name")
                    return jsonify({'error': 'Each language must have language_code and language_name'}), 400
                
            profile = TranslatorProfile(
                user_id=user_id,
                full_name=data['full_name'],
                phone_number=data['phone_number'],
                hourly_rate=hourly_rate,
                languages=data['languages']
            )
            
            db.session.add(profile)
            db.session.commit()
            
            logging.info(f"Translator profile created successfully for user {user_id}")
            return jsonify(profile.as_dict()), 201
            
        except ValueError as e:
            db.session.rollback()
            logging.error(f"Value error creating translator profile: {str(e)}")
            return jsonify({'error': f'Invalid value: {str(e)}'}), 400
        except Exception as e:
            db.session.rollback()
            logging.error(f"Error creating translator profile: {str(e)}")
            return jsonify({'error': str(e)}), 400
    except Exception as e:
        logging.error(f"Unexpected error in create_translator_profile: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@profiles_bp.route('/traveler', methods=['POST'])
@jwt_required()
def create_traveler_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if not user.is_traveler:
        return jsonify({'error': 'User is registered as a translator'}), 400
        
    if user.traveler_profile:
        return jsonify({'error': 'Traveler profile already exists'}), 400
    
    data = request.get_json()
    required_fields = ['full_name', 'phone_number', 'nationality', 'languages_needed']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        profile = TravelerProfile(
            user_id=user_id,
            full_name=data['full_name'],
            phone_number=data['phone_number'],
            nationality=data['nationality'],
            languages_needed=data['languages_needed']
        )
        
        db.session.add(profile)
        db.session.commit()
        
        return jsonify(profile.as_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@profiles_bp.route('/translator/<int:user_id>', methods=['GET'])
@jwt_required()
def get_translator_profile(user_id):
    profile = TranslatorProfile.query.filter_by(user_id=user_id).first()
    
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
        
    return jsonify(profile.as_dict())

@profiles_bp.route('/traveler/<int:user_id>', methods=['GET'])
@jwt_required()
def get_traveler_profile(user_id):
    profile = TravelerProfile.query.filter_by(user_id=user_id).first()
    
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
        
    return jsonify(profile.as_dict())

@profiles_bp.route('/translator/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_translator_profile(user_id):
    current_user_id = get_jwt_identity()
    if str(current_user_id) != str(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
        
    profile = TranslatorProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    data = request.get_json()
    
    try:
        # Update basic fields
        if 'full_name' in data:
            profile.full_name = data['full_name']
        if 'phone_number' in data:
            profile.phone_number = data['phone_number']
        if 'hourly_rate' in data:
            profile.hourly_rate = float(data['hourly_rate'])
        if 'languages' in data:
            profile.languages = data['languages']
        
        # Update additional fields
        if 'photo_url' in data:
            profile.photo_url = data['photo_url']
        if 'location' in data:
            profile.location = data['location']
        if 'bio' in data:
            profile.bio = data['bio']
        if 'is_available' in data:
            profile.is_available = data['is_available']
        if 'education' in data:
            profile.education = data['education']
        if 'certificates' in data:
            profile.certificates = data['certificates']
        if 'specializations' in data and isinstance(data['specializations'], list):
            profile.specializations = data['specializations']
        if 'years_of_experience' in data:
            profile.years_of_experience = data['years_of_experience']
        if 'social_media' in data:
            profile.social_media = data['social_media']
        if 'preferred_meeting_locations' in data and isinstance(data['preferred_meeting_locations'], list):
            profile.preferred_meeting_locations = data['preferred_meeting_locations']
        if 'availability_hours' in data:
            profile.availability_hours = data['availability_hours']
            
        profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(profile.as_dict())
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating translator profile: {str(e)}")
        return jsonify({'error': str(e)}), 400

@profiles_bp.route('/traveler/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_traveler_profile(user_id):
    current_user_id = get_jwt_identity()
    if str(current_user_id) != str(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
        
    profile = TravelerProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    data = request.get_json()
    
    try:
        # Update basic fields
        if 'full_name' in data:
            profile.full_name = data['full_name']
        if 'phone_number' in data:
            profile.phone_number = data['phone_number']
        if 'nationality' in data:
            profile.nationality = data['nationality']
        if 'languages_needed' in data:
            profile.languages_needed = data['languages_needed']
        
        # Update additional fields
        if 'bio' in data:
            profile.bio = data['bio']
        if 'photo_url' in data:
            profile.photo_url = data['photo_url']
        if 'current_location' in data:
            profile.current_location = data['current_location']
        if 'travel_preferences' in data:
            profile.travel_preferences = data['travel_preferences']
        if 'interests' in data and isinstance(data['interests'], list):
            profile.interests = data['interests']
        if 'emergency_contact' in data:
            profile.emergency_contact = data['emergency_contact']
            
        profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(profile.as_dict())
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating traveler profile: {str(e)}")
        return jsonify({'error': str(e)}), 400
