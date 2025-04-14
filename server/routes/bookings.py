from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Booking, User, TranslatorProfile
from extensions import db
import logging
from datetime import datetime, date, time
from decimal import Decimal

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_bookings():
    """Get all bookings for the current user"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get query parameters
        status = request.args.get('status')  # Can be 'upcoming', 'completed', 'cancelled', 'past'
        
        # Base query
        query = Booking.query
        
        # Filter by user type
        if user.is_traveler:
            query = query.filter(Booking.traveler_id == user_id)
        else:
            query = query.filter(Booking.translator_id == user_id)
        
        # Apply status filter
        if status == 'upcoming':
            # Upcoming bookings are those with status 'pending' or 'confirmed' and date >= today
            query = query.filter(
                Booking.status.in_(['pending', 'confirmed']),
                Booking.date >= date.today()
            )
        elif status == 'completed':
            query = query.filter(Booking.status == 'completed')
        elif status == 'cancelled':
            query = query.filter(Booking.status == 'cancelled')
        elif status == 'past':
            # Past bookings are those with status 'completed' or 'cancelled' or date < today
            query = query.filter(
                (Booking.status.in_(['completed', 'cancelled'])) |
                ((Booking.status.in_(['pending', 'confirmed'])) & (Booking.date < date.today()))
            )
        
        # Order by date, newest first
        query = query.order_by(Booking.date.desc(), Booking.start_time.desc())
        
        # Execute query
        bookings = query.all()
        
        # Format response
        response = []
        for booking in bookings:
            # Get user info based on user type
            if user.is_traveler:
                other_user = User.query.get(booking.translator_id)
                translator = TranslatorProfile.query.filter_by(user_id=booking.translator_id).first()
                photo_url = translator.photo_url if translator else ""
            else:
                other_user = User.query.get(booking.traveler_id)
                photo_url = ""  # Travelers don't have photo URLs in this query
            
            # Calculate end time from start_time and duration
            start_datetime = datetime.combine(booking.date, booking.start_time)
            
            booking_data = {
                'id': booking.id,
                'date': booking.date.strftime('%Y-%m-%d'),
                'formatted_date': booking.date.strftime('%b %d'),
                'time': booking.start_time.strftime('%H:%M'),
                'formatted_time': f"{booking.start_time.strftime('%H:%M')} - {(datetime.combine(date.today(), booking.start_time).replace(hour=booking.start_time.hour + booking.duration_hours)).strftime('%H:%M')}",
                'duration_hours': booking.duration_hours,
                'location': booking.location,
                'notes': booking.notes,
                'status': booking.status,
                'amount': float(booking.total_amount),
                'created_at': booking.created_at.isoformat(),
                'updated_at': booking.updated_at.isoformat()
            }
            
            # Add other user info
            if other_user:
                booking_data.update({
                    'other_user_id': other_user.id,
                    'other_user_name': other_user.name,
                    'other_user_photo': photo_url
                })
            
            response.append(booking_data)
        
        return jsonify(response), 200
        
    except Exception as e:
        logging.error(f"Error getting bookings: {str(e)}")
        return jsonify({'error': 'Failed to get bookings'}), 500

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    """Create a new booking"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Only travelers can create bookings
        if not user.is_traveler:
            return jsonify({'error': 'Only travelers can create bookings'}), 403
        
        data = request.get_json()
        required_fields = ['translator_id', 'date', 'start_time', 'duration_hours', 'location', 'total_amount']
        
        # Check required fields
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        # Validate inputs
        try:
            translator_id = int(data['translator_id'])
            booking_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            start_time_str = data['start_time']
            duration_hours = int(data['duration_hours'])
            total_amount = Decimal(str(data['total_amount']))
            
            # Parse time (format should be HH:MM)
            hours, minutes = map(int, start_time_str.split(':'))
            start_time = time(hour=hours, minute=minutes)
            
            # Check if translator exists
            translator = User.query.get(translator_id)
            if not translator or translator.is_traveler:
                return jsonify({'error': 'Invalid translator'}), 400
            
            # Check if translator profile is available
            translator_profile = TranslatorProfile.query.filter_by(user_id=translator_id).first()
            if not translator_profile or not translator_profile.is_available:
                return jsonify({'error': 'Translator is not available'}), 400
            
            # Check if date is in the future
            if booking_date < date.today():
                return jsonify({'error': 'Booking date must be in the future'}), 400
            
            # Check if duration is positive
            if duration_hours <= 0:
                return jsonify({'error': 'Duration must be positive'}), 400
            
            # Check if amount is positive
            if total_amount <= 0:
                return jsonify({'error': 'Amount must be positive'}), 400
            
            # Create booking
            booking = Booking(
                traveler_id=user_id,
                translator_id=translator_id,
                date=booking_date,
                start_time=start_time,
                duration_hours=duration_hours,
                location=data['location'],
                total_amount=total_amount,
                notes=data.get('notes')
            )
            
            db.session.add(booking)
            db.session.commit()
            
            return jsonify({
                'id': booking.id,
                'traveler_id': booking.traveler_id,
                'translator_id': booking.translator_id,
                'date': booking.date.strftime('%Y-%m-%d'),
                'time': booking.start_time.strftime('%H:%M'),
                'duration_hours': booking.duration_hours,
                'location': booking.location,
                'notes': booking.notes,
                'status': booking.status,
                'amount': float(booking.total_amount),
                'created_at': booking.created_at.isoformat(),
                'updated_at': booking.updated_at.isoformat()
            }), 201
            
        except ValueError as e:
            return jsonify({'error': f'Invalid input: {str(e)}'}), 400
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating booking: {str(e)}")
        return jsonify({'error': 'Failed to create booking'}), 500

@bookings_bp.route('/<int:booking_id>', methods=['PUT'])
@jwt_required()
def update_booking(booking_id):
    """Update a booking (cancel, reschedule, etc.)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get booking
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check if user owns the booking
        if user.is_traveler and booking.traveler_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        elif not user.is_traveler and booking.translator_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        action = data.get('action')
        
        # Handle different actions
        if action == 'cancel':
            # Only pending or confirmed bookings can be cancelled
            if booking.status not in ['pending', 'confirmed']:
                return jsonify({'error': f'Cannot cancel booking with status {booking.status}'}), 400
            
            booking.status = 'cancelled'
            
        elif action == 'complete':
            # Only confirmed bookings can be completed
            if booking.status != 'confirmed':
                return jsonify({'error': f'Cannot complete booking with status {booking.status}'}), 400
            
            booking.status = 'completed'
            
        elif action == 'reschedule':
            # Only pending or confirmed bookings can be rescheduled
            if booking.status not in ['pending', 'confirmed']:
                return jsonify({'error': f'Cannot reschedule booking with status {booking.status}'}), 400
            
            # Update booking date and time
            if 'date' in data:
                booking.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            
            if 'start_time' in data:
                hours, minutes = map(int, data['start_time'].split(':'))
                booking.start_time = time(hour=hours, minute=minutes)
            
            if 'duration_hours' in data:
                booking.duration_hours = int(data['duration_hours'])
            
            if 'location' in data:
                booking.location = data['location']
            
        else:
            return jsonify({'error': 'Invalid action'}), 400
        
        # Update notes if provided
        if 'notes' in data:
            booking.notes = data['notes']
        
        db.session.commit()
        
        return jsonify({
            'id': booking.id,
            'traveler_id': booking.traveler_id,
            'translator_id': booking.translator_id,
            'date': booking.date.strftime('%Y-%m-%d'),
            'time': booking.start_time.strftime('%H:%M'),
            'duration_hours': booking.duration_hours,
            'location': booking.location,
            'notes': booking.notes,
            'status': booking.status,
            'amount': float(booking.total_amount),
            'created_at': booking.created_at.isoformat(),
            'updated_at': booking.updated_at.isoformat()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': f'Invalid input: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating booking: {str(e)}")
        return jsonify({'error': 'Failed to update booking'}), 500

@bookings_bp.route('/<int:booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    """Get a specific booking by ID"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get booking
        booking = Booking.query.get(booking_id)
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check if user is related to the booking
        if user.is_traveler and booking.traveler_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        elif not user.is_traveler and booking.translator_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get other user info
        if user.is_traveler:
            other_user = User.query.get(booking.translator_id)
            translator = TranslatorProfile.query.filter_by(user_id=booking.translator_id).first()
            photo_url = translator.photo_url if translator else ""
        else:
            other_user = User.query.get(booking.traveler_id)
            photo_url = ""  # Travelers don't have photo URLs in this context
        
        # Format response
        response = {
            'id': booking.id,
            'date': booking.date.strftime('%Y-%m-%d'),
            'formatted_date': booking.date.strftime('%b %d'),
            'time': booking.start_time.strftime('%H:%M'),
            'formatted_time': f"{booking.start_time.strftime('%H:%M')} - {(datetime.combine(date.today(), booking.start_time).replace(hour=booking.start_time.hour + booking.duration_hours)).strftime('%H:%M')}",
            'duration_hours': booking.duration_hours,
            'location': booking.location,
            'notes': booking.notes,
            'status': booking.status,
            'amount': float(booking.total_amount),
            'created_at': booking.created_at.isoformat(),
            'updated_at': booking.updated_at.isoformat()
        }
        
        # Add other user info
        if other_user:
            response.update({
                'other_user_id': other_user.id,
                'other_user_name': other_user.name,
                'other_user_photo': photo_url
            })
        
        return jsonify(response), 200
        
    except Exception as e:
        logging.error(f"Error getting booking: {str(e)}")
        return jsonify({'error': 'Failed to get booking'}), 500 