from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_socketio import emit, join_room, leave_room
from models import User, ChatMessage, Booking
from extensions import db, socketio
import logging
from sqlalchemy import or_, and_, desc
from datetime import datetime

chat_bp = Blueprint('chat', __name__)

# Helper functions
def get_conversation_partner_id(user_id, conversation_id):
    """Get the ID of the conversation partner based on a booking ID or user ID"""
    try:
        # First check if conversation_id is a booking ID
        booking = Booking.query.filter_by(id=int(conversation_id)).first()
        if booking:
            return booking.translator_id if int(user_id) == booking.traveler_id else booking.traveler_id
        
        # If not, treat conversation_id as a user ID
        return int(conversation_id)
    except ValueError:
        # If conversion to int fails, treat as user ID string
        return conversation_id

def get_or_create_conversation(user_id, other_user_id):
    """Get or create a conversation between two users"""
    # For simplicity, a conversation is just identified by the two users involved
    # We could add a Conversation model in the future for more complex functionality
    return {
        'user_id': user_id,
        'other_user_id': other_user_id
    }

def get_user_conversations(user_id):
    """Get all conversations for a user with the latest message"""
    # Get all users this user has exchanged messages with
    subquery = db.session.query(
        ChatMessage.sender_id.label('user_id')
    ).filter(
        ChatMessage.receiver_id == user_id
    ).union(
        db.session.query(
            ChatMessage.receiver_id.label('user_id')
        ).filter(
            ChatMessage.sender_id == user_id
        )
    ).subquery()
    
    # Get user details for each conversation partner
    conversation_partners = db.session.query(User).join(
        subquery, User.id == subquery.c.user_id
    ).all()
    
    conversations = []
    for partner in conversation_partners:
        # Get the latest message for this conversation
        latest_message = ChatMessage.query.filter(
            or_(
                and_(ChatMessage.sender_id == user_id, ChatMessage.receiver_id == partner.id),
                and_(ChatMessage.sender_id == partner.id, ChatMessage.receiver_id == user_id)
            )
        ).order_by(ChatMessage.created_at.desc()).first()
        
        if latest_message:
            # Get unread count
            unread_count = ChatMessage.query.filter(
                ChatMessage.sender_id == partner.id,
                ChatMessage.receiver_id == user_id,
                ChatMessage.read_at == None
            ).count()
            
            # Check if there are any bookings between these users
            booking = Booking.query.filter(
                or_(
                    and_(Booking.traveler_id == user_id, Booking.translator_id == partner.id),
                    and_(Booking.traveler_id == partner.id, Booking.translator_id == user_id)
                ),
                Booking.status.in_(['confirmed', 'pending'])
            ).order_by(Booking.date.desc()).first()
            
            # Check if the partner is a translator or traveler
            is_translator = not partner.is_traveler
            
            # Get the appropriate profile photo
            photo_url = None
            if is_translator:
                if partner.translator_profile and partner.translator_profile.photo_url:
                    photo_url = partner.translator_profile.photo_url
            else:
                if partner.traveler_profile and partner.traveler_profile.photo_url:
                    photo_url = partner.traveler_profile.photo_url
            
            conversations.append({
                'id': str(partner.id),
                'name': partner.name,
                'photo_url': photo_url,
                'last_message': latest_message.content,
                'last_message_time': latest_message.created_at.isoformat(),
                'unread_count': unread_count,
                'booking_id': str(booking.id) if booking else None,
                'is_online': False  # We'll update this with WebSockets
            })
    
    return conversations

# RESTful API routes
@chat_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    """Get all conversations for the current user"""
    user_id = get_jwt_identity()
    
    try:
        conversations = get_user_conversations(user_id)
        return jsonify({
            'conversations': conversations
        }), 200
    except Exception as e:
        logging.error(f"Error getting conversations: {str(e)}")
        return jsonify({'error': 'Failed to get conversations'}), 500

@chat_bp.route('/conversations/<conversation_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(conversation_id):
    """Get messages for a specific conversation"""
    user_id = get_jwt_identity()
    other_user_id = get_conversation_partner_id(user_id, conversation_id)
    
    try:
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 20)), 50)  # Max 50 messages per request
        
        # Get messages between these two users
        messages = ChatMessage.query.filter(
            or_(
                and_(ChatMessage.sender_id == user_id, ChatMessage.receiver_id == other_user_id),
                and_(ChatMessage.sender_id == other_user_id, ChatMessage.receiver_id == user_id)
            )
        ).order_by(ChatMessage.created_at.desc()).paginate(page=page, per_page=per_page)
        
        # Mark received messages as read
        unread_messages = ChatMessage.query.filter(
            ChatMessage.sender_id == other_user_id,
            ChatMessage.receiver_id == user_id,
            ChatMessage.read_at == None
        ).all()
        
        for message in unread_messages:
            message.mark_as_read()
        
        # Return messages
        return jsonify({
            'messages': [message.as_dict() for message in messages.items],
            'total': messages.total,
            'page': page,
            'per_page': per_page,
            'pages': messages.pages
        }), 200
    except Exception as e:
        logging.error(f"Error getting messages: {str(e)}")
        return jsonify({'error': 'Failed to get messages'}), 500

@chat_bp.route('/conversations/<conversation_id>/messages', methods=['POST'])
@jwt_required()
def send_message(conversation_id):
    """Send a message to a conversation"""
    user_id = get_jwt_identity()
    other_user_id = get_conversation_partner_id(user_id, conversation_id)
    data = request.get_json()
    
    if not data or 'content' not in data:
        return jsonify({'error': 'Content is required'}), 400
    
    try:
        # Create the message
        message = ChatMessage(
            sender_id=user_id,
            receiver_id=other_user_id,
            content=data['content']
        )
        
        db.session.add(message)
        db.session.commit()
        
        # Emit a WebSocket event
        message_data = message.as_dict()
        socketio.emit('new_message', message_data, room=f'user_{other_user_id}')
        
        return jsonify({
            'message': message_data
        }), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error sending message: {str(e)}")
        return jsonify({'error': 'Failed to send message'}), 500

@chat_bp.route('/conversations/<conversation_id>/read', methods=['POST'])
@jwt_required()
def mark_as_read(conversation_id):
    """Mark all messages in a conversation as read"""
    user_id = get_jwt_identity()
    other_user_id = get_conversation_partner_id(user_id, conversation_id)
    
    try:
        # Find all unread messages sent by the other user
        unread_messages = ChatMessage.query.filter(
            ChatMessage.sender_id == other_user_id,
            ChatMessage.receiver_id == user_id,
            ChatMessage.read_at == None
        ).all()
        
        # Mark them as read
        now = datetime.utcnow()
        for message in unread_messages:
            message.read_at = now
        
        db.session.commit()
        
        # Emit a WebSocket event
        socketio.emit('messages_read', {
            'conversation_id': conversation_id,
            'reader_id': user_id
        }, room=f'user_{other_user_id}')
        
        return jsonify({'success': True, 'count': len(unread_messages)}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error marking messages as read: {str(e)}")
        return jsonify({'error': 'Failed to mark messages as read'}), 500

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    # Authentication will be handled by the client sending a 'join' event with the token
    pass

@socketio.on('disconnect')
def handle_disconnect():
    # Update online status, etc.
    pass

@socketio.on('join')
def handle_join(data):
    """Join a user's personal room to receive messages"""
    if 'user_id' not in data:
        return False
    
    user_id = data['user_id']
    room = f'user_{user_id}'
    join_room(room)
    
    # Update online status
    socketio.emit('user_online', {'user_id': user_id}, broadcast=True)
    return True

@socketio.on('leave')
def handle_leave(data):
    """Leave a user's personal room"""
    if 'user_id' not in data:
        return False
    
    user_id = data['user_id']
    room = f'user_{user_id}'
    leave_room(room)
    
    # Update online status
    socketio.emit('user_offline', {'user_id': user_id}, broadcast=True)
    return True

@socketio.on('typing')
def handle_typing(data):
    """Broadcast typing status to the recipient"""
    if 'user_id' not in data or 'recipient_id' not in data:
        return False
    
    socketio.emit('user_typing', {
        'user_id': data['user_id']
    }, room=f'user_{data["recipient_id"]}')
    return True

@socketio.on('stop_typing')
def handle_stop_typing(data):
    """Broadcast stop typing status to the recipient"""
    if 'user_id' not in data or 'recipient_id' not in data:
        return False
    
    socketio.emit('user_stop_typing', {
        'user_id': data['user_id']
    }, room=f'user_{data["recipient_id"]}')
    return True 