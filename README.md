# Human Translator Application

A mobile application that connects travelers with translators in real-time, built with React Native (frontend) and Flask (backend).

## Project Structure

This project is organized as a monorepo with two main directories:

- `client/` - React Native frontend application
- `server/` - Flask backend API

## Features

- User authentication (register, login, password reset)
- Role-based flows for travelers and translators
- User profiles
- Multilingual support with i18n
- JWT-based authentication

## Getting Started

### Backend Setup (Flask)

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Set up PostgreSQL database:
   - Create a database named `human_translator`
   - Update the `.env` file with your database credentials

6. Initialize the database:
   ```
   python init_db.py
   ```

7. Start the server:
   ```
   python app.py
   ```

### Frontend Setup (React Native)

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. For iOS:
   ```
   npm run ios
   ```

5. For Android:
   ```
   npm run android
   ```

## API Documentation

Once the server is running, you can access the root endpoint for basic information:
- API Info: http://localhost:8000/
- API Status: http://localhost:8000/status

## Languages Supported

- English
- Spanish
- French
- German
- Chinese
- Japanese