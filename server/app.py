from flask import Flask, jsonify
from dotenv import load_dotenv
from extensions import db, migrate, jwt, cors
import os
from datetime import timedelta

# Load environment variables
load_dotenv()

def create_app():
    # Initialize Flask app
    app = Flask(__name__)
    
    # Configure app
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/human_translator")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=30)  # Single token with 30 day expiration
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"
    
    # Initialize extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, supports_credentials=True)
    
    # Import models after extensions are initialized
    from models import User, TranslatorProfile, TravelerProfile
    
    # JWT error handlers
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'Invalid token',
            'message': str(error)
        }), 401

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return jsonify({
            'error': 'No token provided',
            'message': str(error)
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({
            'error': 'Token has expired',
            'message': 'Please log in again'
        }), 401
    
    # Health check endpoint
    @app.route('/')
    def index():
        return jsonify({
            "message": "Human Translator API",
            "status": "running"
        })
    
    # Import routes (after app and extensions are initialized to avoid circular imports)
    from routes.auth import auth_bp
    from routes.users import users_bp
    from routes.profiles import profiles_bp
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(profiles_bp, url_prefix='/api/profiles')
    
    return app

# Create the application instance
app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000) 