from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, TranslatorProfile, TravelerProfile, LanguageProficiency
from extensions import db
import logging

users_bp = Blueprint('users', __name__)

@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_user_profile():
    user_id = get_jwt_identity()
    
    # Get user from database
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user.as_dict()
    
    # Get specific profile based on user type
    if user.is_traveler:
        profile = TravelerProfile.query.filter_by(user_id=user_id).first()
        if profile:
            user_data['profile'] = profile.as_dict()
    else:
        profile = TranslatorProfile.query.filter_by(user_id=user_id).first()
        if profile:
            user_data['profile'] = profile.as_dict()
    
    return jsonify(user_data), 200

@users_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_user_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Get user from database
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Update user fields
    if 'name' in data:
        user.name = data['name']
    
    if 'preferred_language' in data:
        user.preferred_language = data['preferred_language']
    
    # Update user profile based on type
    if user.is_traveler:
        profile = TravelerProfile.query.filter_by(user_id=user_id).first()
        
        if profile:
            if 'bio' in data:
                profile.bio = data['bio']
            
            if 'current_location' in data:
                profile.current_location = data['current_location']
            
            if 'travel_preferences' in data:
                profile.travel_preferences = data['travel_preferences']
    else:
        profile = TranslatorProfile.query.filter_by(user_id=user_id).first()
        
        if profile:
            if 'bio' in data:
                profile.bio = data['bio']
            
            if 'hourly_rate' in data:
                profile.hourly_rate = data['hourly_rate']
            
            if 'is_available' in data:
                profile.is_available = data['is_available']
            
            # Handle language proficiencies
            if 'languages' in data and isinstance(data['languages'], list):
                # Clear existing language proficiencies
                LanguageProficiency.query.filter_by(translator_profile_id=profile.id).delete()
                
                # Add new language proficiencies
                for lang in data['languages']:
                    if 'language_code' in lang and 'proficiency_level' in lang:
                        language_proficiency = LanguageProficiency(
                            translator_profile_id=profile.id,
                            language_code=lang['language_code'],
                            proficiency_level=lang['proficiency_level']
                        )
                        db.session.add(language_proficiency)
    
    try:
        db.session.commit()
        
        # Get updated user data
        user_data = user.as_dict()
        
        # Get specific profile based on user type
        if user.is_traveler:
            profile = TravelerProfile.query.filter_by(user_id=user_id).first()
            if profile:
                user_data['profile'] = profile.as_dict()
        else:
            profile = TranslatorProfile.query.filter_by(user_id=user_id).first()
            if profile:
                user_data['profile'] = profile.as_dict()
        
        return jsonify(user_data), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Update profile error: {str(e)}")
        return jsonify({'error': 'Failed to update profile'}), 500

@users_bp.route('/me/language', methods=['GET'])
@jwt_required()
def get_user_language():
    user_id = get_jwt_identity()
    
    # Get user from database
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'preferred_language': user.preferred_language}), 200 