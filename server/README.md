# Human Translator App - Flask Backend

This is the backend server for the Human Translator app, built with Flask and PostgreSQL.

## Setup

### Prerequisites

- Python 3.8+
- PostgreSQL database
- pip (Python package manager)

### Database Setup

1. Create a PostgreSQL database:
   ```
   createdb human_translator
   ```

2. Import the schema:
   ```
   psql -d human_translator -f tables.sql
   ```

### Environment Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Configure environment variables (or modify the `.env` file):
   ```
   # Flask configuration
   FLASK_APP=app
   FLASK_ENV=development
   DEBUG=True
   SECRET_KEY=your_secret_key

   # Database configuration
   DB_USER=postgres
   DB_PASSWORD=root
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=human_translator

   # JWT configuration
   JWT_SECRET_KEY=your_jwt_secret_key
   JWT_ACCESS_TOKEN_EXPIRES=86400
   ```

## Running the Server

1. Start the Flask application:
   ```
   python run.py
   ```

   The server will start on http://localhost:5000 by default.

## API Endpoints

### Authentication

- **Register**: `POST /api/auth/register`
  - Payload: `{ "name": "User Name", "email": "user@example.com", "password": "password123", "confirm_password": "password123", "is_traveler": true, "preferred_language": "en" }`

- **Login**: `POST /api/auth/login`
  - Payload: `{ "email": "user@example.com", "password": "password123" }`

- **Reset Password Request**: `POST /api/auth/reset-password`
  - Payload: `{ "email": "user@example.com" }`

- **Reset Password Confirm**: `POST /api/auth/reset-password/<token>`
  - Payload: `{ "password": "newpassword123", "confirm_password": "newpassword123" }`

- **Get User Type**: `GET /api/auth/user-type`
  - Requires authentication

## Development

### Project Structure

```
server/
├── app/
│   ├── models/
│   │   ├── database.py     # Database configuration
│   │   ├── user.py         # User and auth models
│   │   └── profile.py      # Profile models
│   ├── routes/
│   │   └── auth.py         # Authentication routes
│   ├── utils/
│   │   ├── validators.py   # Input validators
│   │   └── email_service.py # Email service
│   ├── config.py           # App configuration
│   └── __init__.py         # App initialization
├── .env                    # Environment variables
├── requirements.txt        # Dependencies
├── run.py                  # Run script
└── tables.sql              # Database schema
``` 