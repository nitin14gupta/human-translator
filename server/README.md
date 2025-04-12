# Human Translator API

Flask backend for the Human Translator application, providing API endpoints for traveler and translator users.

## Features

- User authentication (register, login, logout)
- Password reset functionality
- JWT token-based authentication
- User profile management
- Support for both traveler and translator user types
- Multi-language support

## Setup

### Prerequisites

- Python 3.8+
- PostgreSQL 12+

### Installation

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a PostgreSQL database:
   ```bash
   createdb human_translator
   ```
5. Create a `.env` file with your configuration (copy from `.env.example`):
   ```bash
   cp .env.example .env
   # Edit the .env file with your database credentials and secret keys
   ```
6. Initialize the database:
   ```bash
   psql -d human_translator -f table.sql
   ```
7. Initialize Flask migrations:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

### Running the Server

```bash
flask run --host=0.0.0.0 --port=8000
```

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Login an existing user
- `POST /api/logout` - Logout a user
- `POST /api/reset-password-request` - Request a password reset
- `POST /api/reset-password-confirm` - Confirm a password reset
- `POST /api/refresh` - Refresh an access token

### User Management

- `GET /api/users/me` - Get the current user's profile
- `PUT /api/users/me` - Update the current user's profile
- `GET /api/users/me/language` - Get the current user's preferred language

## Data Models

The application uses the following main data models:

- `User`: Core user data including authentication
- `TravelerProfile`: Profile data specific to travelers
- `TranslatorProfile`: Profile data specific to translators
- `LanguageProficiency`: Language skills for translators
- `PasswordResetToken`: Tokens for password reset
- `RefreshToken`: Tokens for JWT refresh

## Security

- Passwords are hashed using Werkzeug's security functions
- JWT-based authentication with both access and refresh tokens
- Token expiration and secure token storage 