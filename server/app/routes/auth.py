import uuid
import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required
)
from sqlalchemy.exc import IntegrityError
from app.models import db_session, User, PasswordResetToken
from app.utils import validate_email, validate_password, send_password_reset_email

# Create auth blueprint
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    
    Expected JSON payload:
    {
        "name": "User Name",
        "email": "user@example.com",
        "password": "password123",
        "confirm_password": "password123",
        "is_traveler": true,
        "preferred_language": "en"
    }
    """
    # Get request data
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Invalid request data'}), 400
    
    # Extract fields
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    is_traveler = data.get('is_traveler', True)
    preferred_language = data.get('preferred_language', 'en')
    
    # Validate required fields
    if not (name and email and password and confirm_password):
        return jsonify({'error': 'Name, email, password, and confirm_password are required'}), 400
    
    # Validate email format
    is_valid_email, email_error = validate_email(email)
    if not is_valid_email:
        return jsonify({'error': f'Invalid email: {email_error}'}), 400
    
    # Validate password
    is_valid_password, password_error = validate_password(password)
    if not is_valid_password:
        return jsonify({'error': f'Invalid password: {password_error}'}), 400
    
    # Check if passwords match
    if password != confirm_password:
        return jsonify({'error': 'Passwords do not match'}), 400
    
    try:
        # Check if email already exists
        existing_user = User.query.filter_by(email=email.lower()).first()
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create new user
        user = User(
            name=name,
            email=email,
            password=password,
            is_traveler=is_traveler,
            preferred_language=preferred_language
        )
        
        # Add to database
        db_session.add(user)
        db_session.commit()
        
        # Generate access token
        access_token = create_access_token(identity=user.id)
        
        # Return success response
        return jsonify({
            'message': 'User registered successfully',
            'token': access_token,
            'user': user.to_dict()
        }), 201
    
    except IntegrityError:
        db_session.rollback()
        return jsonify({'error': 'Email already registered'}), 409
    
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login a user
    
    Expected JSON payload:
    {
        "email": "user@example.com",
        "password": "password123"
    }
    """
    # Get request data
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Invalid request data'}), 400
    
    # Extract fields
    email = data.get('email')
    password = data.get('password')
    
    # Validate required fields
    if not (email and password):
        return jsonify({'error': 'Email and password are required'}), 400
    
    try:
        # Find user by email
        user = User.query.filter_by(email=email.lower()).first()
        
        # Check if user exists and password is correct
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate access token
        access_token = create_access_token(identity=user.id)
        
        # Return success response
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password_request():
    """
    Request password reset
    
    Expected JSON payload:
    {
        "email": "user@example.com"
    }
    """
    # Get request data
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Invalid request data'}), 400
    
    # Extract email
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    try:
        # Find user by email
        user = User.query.filter_by(email=email.lower()).first()
        
        # Even if user is not found, return success to prevent email enumeration
        if not user:
            return jsonify({'message': 'If your email is registered, you will receive a password reset link'}), 200
        
        # Generate reset token
        token = str(uuid.uuid4())
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        
        # Save token to database
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=expires_at
        )
        
        # Delete any existing tokens for this user
        PasswordResetToken.query.filter_by(user_id=user.id).delete()
        
        # Add new token
        db_session.add(reset_token)
        db_session.commit()
        
        # Generate reset link
        reset_link = f"http://localhost:3000/reset-password?token={token}"
        
        # Send email
        send_password_reset_email(user.email, reset_link)
        
        # Return success response
        return jsonify({'message': 'If your email is registered, you will receive a password reset link'}), 200
    
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': f'Password reset request failed: {str(e)}'}), 500

@auth_bp.route('/reset-password/<token>', methods=['POST'])
def reset_password_confirm(token):
    """
    Confirm password reset
    
    Expected JSON payload:
    {
        "password": "newpassword123",
        "confirm_password": "newpassword123"
    }
    """
    # Get request data
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Invalid request data'}), 400
    
    # Extract fields
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    
    # Validate required fields
    if not (password and confirm_password):
        return jsonify({'error': 'Password and confirm_password are required'}), 400
    
    # Validate password
    is_valid_password, password_error = validate_password(password)
    if not is_valid_password:
        return jsonify({'error': f'Invalid password: {password_error}'}), 400
    
    # Check if passwords match
    if password != confirm_password:
        return jsonify({'error': 'Passwords do not match'}), 400
    
    try:
        # Find token
        reset_token = PasswordResetToken.query.filter_by(token=token).first()
        
        # Check if token exists
        if not reset_token:
            return jsonify({'error': 'Invalid or expired token'}), 400
        
        # Check if token is expired
        if reset_token.is_expired():
            db_session.delete(reset_token)
            db_session.commit()
            return jsonify({'error': 'Reset token has expired'}), 400
        
        # Get user
        user = User.query.get(reset_token.user_id)
        
        # Update password
        user.set_password(password)
        
        # Delete token
        db_session.delete(reset_token)
        db_session.commit()
        
        # Return success response
        return jsonify({'message': 'Password reset successful'}), 200
    
    except Exception as e:
        db_session.rollback()
        return jsonify({'error': f'Password reset failed: {str(e)}'}), 500

@auth_bp.route('/user-type', methods=['GET'])
@jwt_required()
def get_user_type():
    """Get user type (traveler or translator)"""
    # Get user ID from JWT
    user_id = get_jwt_identity()
    
    try:
        # Find user
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Return user type
        return jsonify({'user_type': 'traveler' if user.is_traveler else 'translator'}), 200
    
    except Exception as e:
        return jsonify({'error': f'Failed to get user type: {str(e)}'}), 500 