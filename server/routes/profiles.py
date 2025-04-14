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
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if user.is_traveler:
        return jsonify({'error': 'User is registered as a traveler'}), 400
        
    if user.translator_profile:
        return jsonify({'error': 'Translator profile already exists'}), 400
    
    data = request.get_json()
    required_fields = ['full_name', 'phone_number', 'hourly_rate', 'languages']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        profile = TranslatorProfile(
            user_id=user_id,
            full_name=data['full_name'],
            phone_number=data['phone_number'],
            hourly_rate=float(data['hourly_rate']),
            languages=data['languages']
        )
        
        db.session.add(profile)
        db.session.commit()
        
        return jsonify(profile.as_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

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
    if current_user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    profile = TranslatorProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'full_name' in data:
            profile.full_name = data['full_name']
        if 'phone_number' in data:
            profile.phone_number = data['phone_number']
        if 'hourly_rate' in data:
            profile.hourly_rate = float(data['hourly_rate'])
        if 'languages' in data:
            profile.languages = data['languages']
            
        profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(profile.as_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@profiles_bp.route('/traveler/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_traveler_profile(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    profile = TravelerProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    data = request.get_json()
    
    try:
        if 'full_name' in data:
            profile.full_name = data['full_name']
        if 'phone_number' in data:
            profile.phone_number = data['phone_number']
        if 'nationality' in data:
            profile.nationality = data['nationality']
        if 'languages_needed' in data:
            profile.languages_needed = data['languages_needed']
            
        profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(profile.as_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
