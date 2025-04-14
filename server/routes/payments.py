from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Booking, db
from decimal import Decimal
import logging
import uuid
from datetime import datetime

payments_bp = Blueprint('payments', __name__, url_prefix='/api/payments')

class Payment:
    """
    Mock Payment Model - in production, you would use a real payment model
    This is for demonstration purposes only
    """
    def __init__(self, booking_id, amount, currency, payment_method):
        self.id = str(uuid.uuid4())
        self.booking_id = booking_id
        self.amount = amount
        self.currency = currency
        self.payment_method = payment_method
        self.status = 'pending'
        self.created_at = datetime.utcnow()
    
    def as_dict(self):
        return {
            'payment_id': self.id,
            'booking_id': self.booking_id,
            'amount': float(self.amount),
            'currency': self.currency,
            'status': self.status,
            'payment_method': self.payment_method,
            'created_at': self.created_at.isoformat()
        }

# In-memory storage for mock payments (replace with database in production)
payments_store = {}

@payments_bp.route('/initiate', methods=['POST'])
@jwt_required()
def initiate_payment():
    """Initiate a payment for a booking"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ['booking_id', 'payment_method']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        user_id = get_jwt_identity()
        booking_id = int(data['booking_id'])
        payment_method = data['payment_method']
        
        # Retrieve booking
        booking = Booking.query.get(booking_id)
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Check if user is the traveler
        if booking.traveler_id != int(user_id):
            return jsonify({'error': 'Unauthorized to make payment for this booking'}), 403
        
        # Check if booking is in a valid state for payment
        if booking.status not in ['pending', 'confirmed']:
            return jsonify({'error': f'Cannot process payment for booking with status {booking.status}'}), 400
        
        # Create a new payment (mock implementation)
        payment = Payment(
            booking_id=booking_id,
            amount=booking.total_amount,
            currency='EUR',
            payment_method=payment_method
        )
        
        # Store payment in memory (replace with database in production)
        payments_store[payment.id] = payment
        
        # In a real implementation, you would:
        # 1. Create a payment intent with a payment processor (Stripe, PayPal, etc.)
        # 2. Return checkout URL or client secret for frontend to complete payment
        
        # Update booking status to 'confirmed' if it was 'pending'
        if booking.status == 'pending':
            booking.status = 'confirmed'
            db.session.commit()
        
        # Return payment details
        return jsonify({
            'payment_id': payment.id,
            'amount': float(payment.amount),
            'currency': payment.currency,
            'checkout_url': f"https://example.com/checkout/{payment.id}"  # Mock URL
        }), 200
        
    except ValueError as e:
        logging.error(f"Value error in payment initiation: {str(e)}")
        return jsonify({'error': 'Invalid parameters provided'}), 400
    except Exception as e:
        logging.error(f"Error initiating payment: {str(e)}")
        return jsonify({'error': 'Failed to initiate payment'}), 500

@payments_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_payment():
    """Verify a payment (mock implementation)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ['payment_id']):
            return jsonify({'error': 'Missing payment_id'}), 400
        
        payment_id = data['payment_id']
        transaction_id = data.get('transaction_id', str(uuid.uuid4()))  # Generate if not provided
        
        # Find payment
        payment = payments_store.get(payment_id)
        
        if not payment:
            return jsonify({'error': 'Payment not found'}), 404
        
        user_id = get_jwt_identity()
        
        # Get booking to check ownership
        booking = Booking.query.get(payment.booking_id)
        
        if not booking:
            return jsonify({'error': 'Associated booking not found'}), 404
        
        # Check if user is the traveler
        if booking.traveler_id != int(user_id):
            return jsonify({'error': 'Unauthorized to verify this payment'}), 403
        
        # Update payment status (in a real implementation, you would verify with payment processor)
        payment.status = 'completed'
        
        # Return success response
        return jsonify({
            'status': 'success',
            'booking_id': str(payment.booking_id),
            'payment_id': payment.id,
            'amount': float(payment.amount)
        }), 200
        
    except Exception as e:
        logging.error(f"Error verifying payment: {str(e)}")
        return jsonify({'error': 'Failed to verify payment'}), 500

@payments_bp.route('/history', methods=['GET'])
@jwt_required()
def get_payment_history():
    """Get payment history for user"""
    try:
        user_id = get_jwt_identity()
        
        # Get all bookings for this user (as traveler)
        bookings = Booking.query.filter_by(traveler_id=user_id).all()
        
        # Get booking IDs
        booking_ids = [booking.id for booking in bookings]
        
        # Filter payments by booking IDs (in a real implementation, this would be a database query)
        user_payments = [
            payment.as_dict() for payment in payments_store.values()
            if payment.booking_id in booking_ids
        ]
        
        return jsonify(user_payments), 200
        
    except Exception as e:
        logging.error(f"Error getting payment history: {str(e)}")
        return jsonify({'error': 'Failed to retrieve payment history'}), 500 