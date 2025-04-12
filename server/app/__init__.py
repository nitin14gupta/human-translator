from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.models import db_session, init_db, shutdown_session
from app.routes import auth_bp
from app.config import get_config

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(get_config())
    
    # Enable CORS
    CORS(app)
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Initialize database
    with app.app_context():
        init_db()
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Register database session cleanup
    @app.teardown_appcontext
    def cleanup(exc):
        shutdown_session()
    
    return app 