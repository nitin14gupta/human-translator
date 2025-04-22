from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Booking, db
from decimal import Decimal
import logging
import uuid
from datetime import datetime, timedelta
from sqlalchemy import func

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

# In-memory storage for mock payouts (replace with database in production)
payouts_store = {}

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

# New endpoints for translator earnings

@payments_bp.route('/earnings', methods=['GET'])
@jwt_required()
def get_earnings_summary():
    """Get earnings summary for a translator"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Ensure user is a translator
        if user.is_traveler:
            return jsonify({'error': 'Only translators can access earnings'}), 403
        
        # Get current date for filtering
        current_date = datetime.utcnow().date()
        start_of_week = current_date - timedelta(days=current_date.weekday())
        end_of_week = start_of_week + timedelta(days=6)
        
        # Get all completed bookings for this translator
        completed_bookings = Booking.query.filter(
            Booking.translator_id == user_id,
            Booking.status == 'completed'
        ).all()
        
        # Get bookings completed today
        today_bookings = [b for b in completed_bookings if b.date == current_date]
        today_earnings = sum(float(b.total_amount) for b in today_bookings)
        
        # Get all time earnings
        total_earnings = sum(float(b.total_amount) for b in completed_bookings)
        
        # Get pending payments (bookings that are confirmed but not completed)
        pending_bookings = Booking.query.filter(
            Booking.translator_id == user_id,
            Booking.status == 'confirmed'
        ).all()
        pending_earnings = sum(float(b.total_amount) for b in pending_bookings)
        
        # Get weekly earnings breakdown
        # In a real implementation, this would use actual completion dates 
        # rather than booking dates
        weekly_earnings = [0] * 7  # [Monday, Tuesday, ..., Sunday]
        
        for booking in completed_bookings:
            booking_date = booking.date
            # Check if the booking is from this week
            if start_of_week <= booking_date <= end_of_week:
                # Get day of week (0 = Monday, 6 = Sunday)
                day_of_week = booking_date.weekday()
                weekly_earnings[day_of_week] += float(booking.total_amount)
        
        # Get total payouts (in a real implementation, this would be from the database)
        total_payouts = sum(float(payout.get('amount', 0)) for payout in payouts_store.values() 
                          if payout.get('translator_id') == user_id)
        
        return jsonify({
            'today_earnings': today_earnings,
            'total_earnings': total_earnings,
            'pending_earnings': pending_earnings,
            'available_balance': total_earnings - total_payouts,
            'total_payouts': total_payouts,
            'weekly_earnings': weekly_earnings,
            'weekly_labels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting earnings summary: {str(e)}")
        return jsonify({'error': 'Failed to retrieve earnings summary'}), 500

@payments_bp.route('/earnings/transactions', methods=['GET'])
@jwt_required()
def get_earnings_transactions():
    """Get all earnings transactions for a translator"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Ensure user is a translator
        if user.is_traveler:
            return jsonify({'error': 'Only translators can access earnings'}), 403
        
        # Get transaction type from query params (earnings, payouts, or all)
        transaction_type = request.args.get('type', 'all')
        
        # Get all completed bookings for this translator (earnings)
        bookings = []
        if transaction_type in ['all', 'earnings']:
            completed_bookings = Booking.query.filter(
                Booking.translator_id == user_id,
                Booking.status.in_(['completed', 'confirmed'])
            ).order_by(Booking.date.desc()).all()
            
            # Convert bookings to transactions
            for booking in completed_bookings:
                # Get traveler info
                traveler = User.query.get(booking.traveler_id)
                traveler_name = traveler.name if traveler else "Unknown Traveler"
                
                # Format date
                if booking.date == datetime.utcnow().date():
                    date_str = f"Today, {booking.start_time.strftime('%H:%M')}"
                elif booking.date == datetime.utcnow().date() - timedelta(days=1):
                    date_str = f"Yesterday, {booking.start_time.strftime('%H:%M')}"
                else:
                    date_str = booking.date.strftime('%b %d, %Y')
                
                bookings.append({
                    'id': str(booking.id),
                    'travelerName': traveler_name,
                    'date': date_str,
                    'amount': float(booking.total_amount),
                    'status': booking.status,
                    'type': 'earning'
                })
        
        # Get all payouts for this translator
        payouts = []
        if transaction_type in ['all', 'payouts']:
            # In a real implementation, this would query a Payouts table
            translator_payouts = [payout for payout in payouts_store.values() 
                               if payout.get('translator_id') == user_id]
            
            for payout in translator_payouts:
                date_str = datetime.fromisoformat(payout.get('created_at')).strftime('%b %d, %Y')
                payouts.append({
                    'id': payout.get('id'),
                    'travelerName': 'Bank Transfer',  # Or the actual payment method
                    'date': date_str,
                    'amount': float(payout.get('amount')),
                    'status': 'completed',
                    'type': 'payout'
                })
        
        # Combine and sort transactions by date (newest first)
        # In a real implementation, you'd do this ordering in the database query
        transactions = sorted(bookings + payouts, 
                            key=lambda x: x['date'], 
                            reverse=True)
        
        return jsonify(transactions), 200
        
    except Exception as e:
        logging.error(f"Error getting earnings transactions: {str(e)}")
        return jsonify({'error': 'Failed to retrieve earnings transactions'}), 500

@payments_bp.route('/earnings/withdraw', methods=['POST'])
@jwt_required()
def withdraw_earnings():
    """Process a withdrawal request for a translator"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Ensure user is a translator
        if user.is_traveler:
            return jsonify({'error': 'Only translators can withdraw earnings'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ['amount', 'payment_method']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Get amount to withdraw
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({'error': 'Amount must be positive'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid amount'}), 400
        
        payment_method = data['payment_method']
        
        # Calculate available balance
        completed_bookings = Booking.query.filter(
            Booking.translator_id == user_id,
            Booking.status == 'completed'
        ).all()
        total_earnings = sum(float(b.total_amount) for b in completed_bookings)
        
        # Get total payouts
        total_payouts = sum(float(payout.get('amount', 0)) for payout in payouts_store.values() 
                          if payout.get('translator_id') == user_id)
        
        available_balance = total_earnings - total_payouts
        
        # Check if user has enough balance
        if amount > available_balance:
            return jsonify({'error': 'Insufficient balance'}), 400
        
        # Process withdrawal
        payout_id = str(uuid.uuid4())
        payout = {
            'id': payout_id,
            'translator_id': user_id,
            'amount': amount,
            'payment_method': payment_method,
            'status': 'completed',
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Store payout in memory
        payouts_store[payout_id] = payout
        
        # Return success response
        return jsonify({
            'status': 'success',
            'payout_id': payout_id,
            'amount': amount,
            'new_balance': available_balance - amount
        }), 200
        
    except Exception as e:
        logging.error(f"Error processing withdrawal: {str(e)}")
        return jsonify({'error': 'Failed to process withdrawal'}), 500 