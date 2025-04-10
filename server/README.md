# Human Translator API

Backend for the Human Translator application, handling user authentication and language preferences.

## Features

- User authentication (register, login)
- User language preference management
- PostgreSQL database integration

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```
     source venv/bin/activate
     ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up PostgreSQL database:
   - Create a database named `human_translator`
   - Update the `.env` file with your database credentials

5. Start the server:
   ```
   uvicorn app.main:app --reload
   ```

## API Endpoints

- **POST /token** - Get authentication token
- **POST /users/** - Create a new user
- **GET /users/me** - Get current user information
- **PUT /users/me/language** - Update user language preference
- **GET /users/me/language** - Get user language preference

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc