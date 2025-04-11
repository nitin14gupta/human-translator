from flask import Flask, jsonify
from dotenv import load_dotenv
from extensions import db, migrate, jwt, cors
import os

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure app
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/human_translator")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))  # 1 hour
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 2592000))  # 30 days

# Initialize extensions with the app
db.init_app(app)
migrate.init_app(app, db)
jwt.init_app(app)
cors.init_app(app, supports_credentials=True)

# Import models after extensions are initialized
import models

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

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(users_bp, url_prefix='/api/users')

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000) 