from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import TranslatorProfile, User, Rating, Booking
from extensions import db
import logging
from sqlalchemy import func

translators_bp = Blueprint('translators', __name__)

@translators_bp.route('/search', methods=['GET'])
@jwt_required()
def search_translators():
    try:
        # Get query parameters with defaults
        language = request.args.get('language')
        location = request.args.get('location')
        available = request.args.get('available', '').lower() == 'true'
        min_rating = request.args.get('min_rating')
        page = max(1, int(request.args.get('page', 1)))
        per_page = min(50, int(request.args.get('per_page', 10)))  # Limit max results
        
        # Start building query
        query = TranslatorProfile.query
        
        # Apply filters
        if language:
            # Search in JSON array for language code
            query = query.filter(
                TranslatorProfile.languages.contains([{'language_code': language}])
            )
        
        if location:
            query = query.filter(
                TranslatorProfile.location.ilike(f"%{location}%")
            )
        
        if available:
            query = query.filter(TranslatorProfile.is_available == True)
        
        if min_rating and min_rating.replace('.', '').isdigit():
            min_rating = float(min_rating)
            # Subquery to get average ratings
            ratings_subq = db.session.query(
                Rating.reviewee_id,
                func.avg(Rating.rating).label('avg_rating')
            ).group_by(Rating.reviewee_id).having(
                func.avg(Rating.rating) >= min_rating
            ).subquery()
            
            query = query.join(
                ratings_subq,
                TranslatorProfile.user_id == ratings_subq.c.reviewee_id
            )
        
        # Order by availability first, then rating (if exists), then hourly rate
        query = query.outerjoin(
            Rating,
            TranslatorProfile.user_id == Rating.reviewee_id
        ).group_by(
            TranslatorProfile.id
        ).order_by(
            TranslatorProfile.is_available.desc(),
            func.coalesce(func.avg(Rating.rating), 0).desc(),
            TranslatorProfile.hourly_rate.asc()
        )
        
        # Execute paginated query
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Prepare response
        translators = []
        for profile in paginated.items:
            translator_data = profile.as_dict()
            # Add any additional processing here if needed
            translators.append(translator_data)
        
        return jsonify({
            'translators': translators,
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }), 200
        
    except ValueError as e:
        logging.error(f"Invalid parameter in translator search: {str(e)}")
        return jsonify({'error': 'Invalid parameters provided'}), 400
    except Exception as e:
        logging.error(f"Error searching translators: {str(e)}")
        return jsonify({'error': 'Failed to search translators'}), 500

@translators_bp.route('/<int:translator_id>', methods=['GET'])
@jwt_required()
def get_translator(translator_id):
    try:
        translator = TranslatorProfile.query.filter_by(user_id=translator_id).first()
        
        if not translator:
            return jsonify({'error': 'Translator not found'}), 404
            
        return jsonify(translator.as_dict()), 200
        
    except Exception as e:
        logging.error(f"Error getting translator details: {str(e)}")
        return jsonify({'error': 'Failed to get translator details'}), 500 