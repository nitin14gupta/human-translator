from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User, PasswordResetToken
from extensions import db
from email_validator import validate_email, EmailNotValidError
import re
from datetime import datetime, timedelta
import logging

auth_bp = Blueprint('auth', __name__)

# Helper function to validate email
def is_valid_email(email):
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False

# Helper function to validate password
def is_valid_password(password):
    # Password should be at least 8 characters long
    if len(password) < 8:
        return False
    # Password should contain at least one uppercase, one lowercase, and one digit
    if not re.search(r'[A-Z]', password) or not re.search(r'[a-z]', password) or not re.search(r'[0-9]', password):
        return False
    return True

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'name', 'is_traveler']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # Add confirm_password validation if provided
    if 'confirm_password' in data and data['password'] != data['confirm_password']:
        return jsonify({'error': 'Passwords do not match'}), 400
    
    # Validate email
    if not is_valid_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Validate password if not already validated with confirm password
    if not is_valid_password(data['password']):
        return jsonify({'error': 'Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters'}), 400
    
    # Get preferred language from data or use default
    preferred_language = data.get('preferred_language', 'en')
    
    # Create user
    try:
        user = User(
            email=data['email'],
            name=data['name'],
            is_traveler=data['is_traveler'],
            preferred_language=preferred_language
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Generate single token
        access_token = create_access_token(identity=str(user.id))
        
        # Don't create empty profiles here - let user fill them in later
        
        return jsonify({
            'user_id': user.id,
            'token': access_token,
            'is_traveler': user.is_traveler,
            'preferred_language': user.preferred_language,
            'message': 'User registered successfully'
        }), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Failed to register user'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['email', 'password']):
        return jsonify({'error': 'Missing email or password'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    
    # Check if user exists and password is correct
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Generate single token
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'user_id': user.id,
        'token': access_token,
        'is_traveler': user.is_traveler,
        'preferred_language': user.preferred_language,
        'message': 'Login successful'
    }), 200

@auth_bp.route('/reset-password-request', methods=['POST'])
def reset_password_request():
    data = request.get_json()
    
    # Validate required fields
    if 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    
    # Generate reset token regardless of whether user exists (for security)
    if user:
        token = PasswordResetToken.create_token(user.id)
        
        # In a real application, you would send an email with the reset link
        # For demo purposes, we'll just return the token in the response
        logging.info(f"Password reset token for {user.email}: {token}")
        
        # This would be where you send an email with a link like:
        # https://yourdomain.com/reset-password?token={token}
        
    return jsonify({
        'message': 'If an account with that email exists, a password reset link has been sent'
    }), 200

@auth_bp.route('/reset-password-confirm', methods=['POST'])
def reset_password_confirm():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ['token', 'new_password']):
        return jsonify({'error': 'Token and new password are required'}), 400
    
    # Validate password
    if not is_valid_password(data['new_password']):
        return jsonify({'error': 'Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters'}), 400
    
    # Verify token and get user_id
    user_id = PasswordResetToken.verify_token(data['token'])
    
    if not user_id:
        return jsonify({'error': 'Invalid or expired token'}), 400
    
    # Find user
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Update password
    try:
        user.set_password(data['new_password'])
        
        # Delete the used token
        PasswordResetToken.query.filter_by(user_id=user_id).delete()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Password reset successful'
        }), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Password reset error: {str(e)}")
        return jsonify({'error': 'Failed to reset password'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({
        'message': 'Logged out successfully'
    }), 200 