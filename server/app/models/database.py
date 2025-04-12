from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
from app.config import get_config

# Get database URI from configuration
config = get_config()
DATABASE_URI = config.SQLALCHEMY_DATABASE_URI

# Create engine and session
engine = create_engine(DATABASE_URI)
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# Base class for all models
Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    """Initialize the database"""
    # Import all modules here that define models
    from app.models.user import User, PasswordResetToken
    from app.models.profile import TravelerProfile, TranslatorProfile, Language
    
    # Create all tables
    Base.metadata.create_all(bind=engine)

def shutdown_session(exception=None):
    """Remove the session"""
    db_session.remove() 