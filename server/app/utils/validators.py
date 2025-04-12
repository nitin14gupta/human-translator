import re
from email_validator import validate_email as validate_email_format, EmailNotValidError

def validate_email(email):
    """
    Validate an email address
    
    Returns:
        tuple: (bool, str) - (is_valid, error_message)
    """
    try:
        # Validate email format
        validate_email_format(email)
        return True, None
    except EmailNotValidError as e:
        return False, str(e)

def validate_password(password):
    """
    Validate a password
    
    Requirements:
    - At least 6 characters
    
    Returns:
        tuple: (bool, str) - (is_valid, error_message)
    """
    # Check length
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    
    return True, None 