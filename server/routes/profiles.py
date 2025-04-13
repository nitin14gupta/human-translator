from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, TranslatorProfile, TravelerProfile, LanguageProficiency
from extensions import db
import os
import logging
import uuid
import json
from werkzeug.utils import secure_filename
from datetime import datetime

profiles_bp = Blueprint('profiles', __name__)

# Configure upload settings
UPLOAD_FOLDER = 'uploads/profile_images'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Helper function to check if file extension is allowed
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@profiles_bp.route('/', methods=['POST'])
@jwt_required()
def create_profile():
    user_id = get_jwt_identity()
    
    # Get user from database
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if profile already exists
    if user.is_traveler:
        existing_profile = TravelerProfile.query.filter_by(user_id=user_id).first()
        if existing_profile:
            return jsonify({'error': 'Profile already exists'}), 400
    else:
        existing_profile = TranslatorProfile.query.filter_by(user_id=user_id).first()
        if existing_profile:
            return jsonify({'error': 'Profile already exists'}), 400
    
    try:
        # Handle multipart/form-data (file upload)
        profile_picture_filename = None
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            
            # If file exists and has allowed extension
            if file and allowed_file(file.filename):
                # Create secure filename with unique identifier
                filename = secure_filename(file.filename)
                filename = f"{user_id}_{uuid.uuid4()}_{filename}"
                
                # Save file to upload folder
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(file_path)
                profile_picture_filename = filename
            else:
                return jsonify({'error': 'Invalid file type'}), 400
        
        # Get profile data from form or JSON
        if request.form.get('profile_data'):
            profile_data = json.loads(request.form.get('profile_data', '{}'))
        else:
            profile_data = request.get_json() or {}
        
        # Create appropriate profile based on user type
        if user.is_traveler:
            profile = TravelerProfile(
                user_id=user_id,
                bio=profile_data.get('bio', ''),
                profile_picture=profile_picture_filename,
                phone_number=profile_data.get('phone_number', ''),
                nationality=profile_data.get('nationality', ''),
                current_location=profile_data.get('current_location', ''),
                emergency_contact=profile_data.get('emergency_contact', ''),
                travel_preferences=profile_data.get('travel_preferences', ''),
                languages_needed=profile_data.get('languages_needed', ''),
                dietary_restrictions=profile_data.get('dietary_restrictions', ''),
                medical_conditions=profile_data.get('medical_conditions', '')
            )
            db.session.add(profile)
            db.session.commit()
        else:
            profile = TranslatorProfile(
                user_id=user_id,
                bio=profile_data.get('bio', ''),
                profile_picture=profile_picture_filename,
                phone_number=profile_data.get('phone_number', ''),
                specialties=profile_data.get('specialties', ''),
                hourly_rate=profile_data.get('hourly_rate', 0),
                is_available=profile_data.get('is_available', True),
                experience_years=profile_data.get('experience_years', 0),
                education=profile_data.get('education', ''),
                certificates=profile_data.get('certificates', ''),
                emergency_contact=profile_data.get('emergency_contact', '')
            )
            db.session.add(profile)
            db.session.commit()
            
            # Handle language proficiencies if provided
            if 'languages' in profile_data and isinstance(profile_data['languages'], list):
                for lang in profile_data['languages']:
                    if 'language_code' in lang and 'proficiency_level' in lang:
                        language_proficiency = LanguageProficiency(
                            translator_profile_id=profile.id,
                            language_code=lang['language_code'],
                            proficiency_level=lang['proficiency_level']
                        )
                        db.session.add(language_proficiency)
                
                db.session.commit()
        
        return jsonify({
            'message': 'Profile created successfully',
            'profile_id': profile.id,
            'profile': profile.as_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating profile: {str(e)}")
        return jsonify({'error': 'Failed to create profile'}), 500

@profiles_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    
    # Get user from database
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get specific profile based on user type
    if user.is_traveler:
        profile = TravelerProfile.query.filter_by(user_id=user_id).first()
    else:
        profile = TranslatorProfile.query.filter_by(user_id=user_id).first()
    
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    return jsonify(profile.as_dict()), 200

@profiles_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    
    # Get user from database
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get specific profile based on user type
    if user.is_traveler:
        profile = TravelerProfile.query.filter_by(user_id=user_id).first()
    else:
        profile = TranslatorProfile.query.filter_by(user_id=user_id).first()
    
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    try:
        # Handle multipart/form-data (file upload)
        profile_picture_filename = None
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            
            # If file exists and has allowed extension
            if file and allowed_file(file.filename):
                # Create secure filename with unique identifier
                filename = secure_filename(file.filename)
                filename = f"{user_id}_{uuid.uuid4()}_{filename}"
                
                # Save file to upload folder
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(file_path)
                profile_picture_filename = filename
            else:
                return jsonify({'error': 'Invalid file type'}), 400
        
        # Get profile data from form or JSON
        if request.form.get('profile_data'):
            profile_data = json.loads(request.form.get('profile_data', '{}'))
        else:
            profile_data = request.get_json() or {}
        
        # Update profile picture if a new one was uploaded
        if profile_picture_filename:
            profile.profile_picture = profile_picture_filename
        
        # Update profile data based on user type
        if user.is_traveler:
            # Update traveler profile fields
            if 'bio' in profile_data:
                profile.bio = profile_data['bio']
            
            if 'phone_number' in profile_data:
                profile.phone_number = profile_data['phone_number']
                
            if 'nationality' in profile_data:
                profile.nationality = profile_data['nationality']
            
            if 'current_location' in profile_data:
                profile.current_location = profile_data['current_location']
                
            if 'emergency_contact' in profile_data:
                profile.emergency_contact = profile_data['emergency_contact']
            
            if 'travel_preferences' in profile_data:
                profile.travel_preferences = profile_data['travel_preferences']
                
            if 'languages_needed' in profile_data:
                profile.languages_needed = profile_data['languages_needed']
                
            if 'dietary_restrictions' in profile_data:
                profile.dietary_restrictions = profile_data['dietary_restrictions']
                
            if 'medical_conditions' in profile_data:
                profile.medical_conditions = profile_data['medical_conditions']
        else:
            # Update translator profile fields
            if 'bio' in profile_data:
                profile.bio = profile_data['bio']
            
            if 'phone_number' in profile_data:
                profile.phone_number = profile_data['phone_number']
                
            if 'specialties' in profile_data:
                profile.specialties = profile_data['specialties']
            
            if 'hourly_rate' in profile_data:
                profile.hourly_rate = profile_data['hourly_rate']
            
            if 'is_available' in profile_data:
                profile.is_available = profile_data['is_available']
                
            if 'experience_years' in profile_data:
                profile.experience_years = profile_data['experience_years']
                
            if 'education' in profile_data:
                profile.education = profile_data['education']
                
            if 'certificates' in profile_data:
                profile.certificates = profile_data['certificates']
                
            if 'emergency_contact' in profile_data:
                profile.emergency_contact = profile_data['emergency_contact']
            
            # Handle language proficiencies
            if 'languages' in profile_data and isinstance(profile_data['languages'], list):
                # Clear existing language proficiencies
                LanguageProficiency.query.filter_by(translator_profile_id=profile.id).delete()
                
                # Add new language proficiencies
                for lang in profile_data['languages']:
                    if 'language_code' in lang and 'proficiency_level' in lang:
                        language_proficiency = LanguageProficiency(
                            translator_profile_id=profile.id,
                            language_code=lang['language_code'],
                            proficiency_level=lang['proficiency_level']
                        )
                        db.session.add(language_proficiency)
        
        # Update timestamp
        profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': profile.as_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating profile: {str(e)}")
        return jsonify({'error': 'Failed to update profile'}), 500

@profiles_bp.route('/images/<filename>', methods=['GET'])
def get_profile_image(filename):
    """Serve profile images from the upload directory"""
    return send_from_directory(UPLOAD_FOLDER, filename) 