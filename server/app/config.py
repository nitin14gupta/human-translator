import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class"""
    # Flask config
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret-key')
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    # Database config
    DB_USER = os.environ.get('DB_USER', 'postgres')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', 'root')
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = os.environ.get('DB_PORT', '5432')
    DB_NAME = os.environ.get('DB_NAME', 'human_translator')
    
    SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT config
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'default-jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 86400))
    )
    
    # CORS config
    CORS_HEADERS = 'Content-Type'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

# Get the configuration based on environment
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}

# Get the current configuration
def get_config():
    env = os.environ.get('FLASK_ENV', 'development')
    return config_by_name[env] 