import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Setup logging
logger = logging.getLogger(__name__)

def send_password_reset_email(to_email, reset_link):
    """
    Send password reset email
    
    In a real app, this would send an actual email using SMTP.
    For now, it just logs the reset link.
    
    Args:
        to_email (str): Email address to send to
        reset_link (str): Password reset link
    
    Returns:
        bool: True if the email was sent successfully, False otherwise
    """
    try:
        # Log the reset link for development purposes
        logger.info(f"Reset password link for {to_email}: {reset_link}")
        
        # In a real application, enable this code and configure email settings
        # in the .env file
        '''
        # Email configuration
        smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', 587))
        smtp_username = os.environ.get('SMTP_USERNAME')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = to_email
        msg['Subject'] = "Reset Your Password - Human Translator App"
        
        # Email body
        body = f"""
        <html>
        <body>
            <h2>Reset Your Password</h2>
            <p>You have requested to reset your password. Click the link below to reset it:</p>
            <p><a href="{reset_link}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
            <p>The link will expire in 1 hour.</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Connect to SMTP server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        
        # Send email
        server.send_message(msg)
        server.quit()
        '''
        
        return True
    except Exception as e:
        logger.error(f"Error sending password reset email: {str(e)}")
        return False 