# API Documentation

## Base URL
- Development: `http://localhost:8000`
- Android Emulator: `http://10.0.2.2:8000`

## Authentication
Most endpoints require JWT authentication. Include the token in request header:
```
Authorization: Bearer <your_token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/register
```
**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "Password123",
    "name": "John Doe",
    "is_traveler": true,
    "preferred_language": "en"  // optional, defaults to "en"
}
```
**Response (201):**
```json
{
    "user_id": 1,
    "token": "eyJhbGc...",
    "is_traveler": true,
    "preferred_language": "en",
    "message": "User registered successfully"
}
```

#### Login
```http
POST /api/login
```
**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "Password123"
}
```
**Response (200):**
```json
{
    "user_id": 1,
    "token": "eyJhbGc...",
    "is_traveler": true,
    "preferred_language": "en",
    "message": "Login successful"
}
```

#### Logout
```http
POST /api/logout
```
**Headers Required:** `Authorization`

**Response (200):**
```json
{
    "message": "Logged out successfully"
}
```

### Profile Management

#### Create Translator Profile
```http
POST /api/profiles/translator
```
**Headers Required:** `Authorization`

**Request Body:**
```json
{
    "full_name": "John Smith",
    "phone_number": "1234567890",
    "hourly_rate": 25.50,
    "languages": [
        {
            "language_code": "es",
            "language_name": "Spanish",
            "proficiency_level": "native"
        },
        {
            "language_code": "fr",
            "language_name": "French",
            "proficiency_level": "advanced"
        }
    ]
}
```
**Response (201):**
```json
{
    "id": 1,
    "user_id": 1,
    "full_name": "John Smith",
    "phone_number": "1234567890",
    "hourly_rate": 25.50,
    "languages": [...],
    "created_at": "2025-04-14T10:30:00Z",
    "updated_at": "2025-04-14T10:30:00Z"
}
```

#### Create Traveler Profile
```http
POST /api/profiles/traveler
```
**Headers Required:** `Authorization`

**Request Body:**
```json
{
    "full_name": "Jane Doe",
    "phone_number": "1234567890",
    "nationality": "American",
    "languages_needed": [
        {
            "language_code": "ja",
            "language_name": "Japanese"
        },
        {
            "language_code": "zh",
            "language_name": "Chinese"
        }
    ]
}
```
**Response (201):**
```json
{
    "id": 1,
    "user_id": 1,
    "full_name": "Jane Doe",
    "phone_number": "1234567890",
    "nationality": "American",
    "languages_needed": [...],
    "created_at": "2025-04-14T10:30:00Z",
    "updated_at": "2025-04-14T10:30:00Z"
}
```

### User Management

#### Get User Profile
```http
GET /api/users/me
```
**Headers Required:** `Authorization`

**Response (200):**
```json
{
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "is_traveler": true,
    "preferred_language": "en",
    "profile": {
        // Profile details if exists
    }
}
```

#### Update User Profile
```http
PUT /api/users/me
```
**Headers Required:** `Authorization`

**Request Body:**
```json
{
    "name": "John Smith",
    "preferred_language": "es"
}
```
**Response (200):**
```json
{
    "id": 1,
    "email": "user@example.com",
    "name": "John Smith",
    "is_traveler": true,
    "preferred_language": "es",
    "profile": {
        // Profile details if exists
    }
}
```

### Password Reset

#### Request Password Reset
```http
POST /api/reset-password-request
```
**Request Body:**
```json
{
    "email": "user@example.com"
}
```
**Response (200):**
```json
{
    "message": "If an account with that email exists, a password reset link has been sent"
}
```

#### Confirm Password Reset
```http
POST /api/reset-password-confirm
```
**Request Body:**
```json
{
    "token": "reset_token_here",
    "new_password": "NewPassword123"
}
```
**Response (200):**
```json
{
    "message": "Password reset successful"
}
```

### Traveler Features

#### Search Translators
```http
GET /api/translators/search
```
**Headers Required:** `Authorization`

**Query Parameters:**
```
language: string (optional) - Filter by language code (e.g., 'es' for Spanish)
location: string (optional) - Filter by location (fuzzy search)
available: boolean (optional) - Filter by availability (true/false)
min_rating: number (optional) - Filter by minimum rating (e.g., 4.8)
page: number (optional) - Page number for pagination (default: 1)
per_page: number (optional) - Results per page (default: 10)
```

**Response (200):**
```json
{
    "translators": [
        {
            "id": 1,
            "full_name": "John Smith",
            "photo_url": "https://example.com/photo.jpg",
            "languages": [
                {
                    "language_code": "es",
                    "language_name": "Spanish",
                    "proficiency_level": "native"
                }
            ],
            "location": "Madrid, Spain",
            "rating": 4.8,
            "reviews": 42,
            "hourly_rate": 25.50,
            "is_available": true,
            "total_sessions": 156
        }
    ],
    "total": 1,
    "page": 1,
    "per_page": 10,
    "pages": 1
}
```

#### Get Translator Details
```http
GET /api/translators/:id
```
**Headers Required:** `Authorization`

**Response (200):**
```json
{
    "id": 1,
    "full_name": "John Smith",
    "photo_url": "https://example.com/photo.jpg",
    "languages": [
        {
            "language_code": "es",
            "language_name": "Spanish",
            "proficiency_level": "native"
        }
    ],
    "location": "Madrid, Spain",
    "rating": 4.8,
    "reviews": 42,
    "hourly_rate": 25.50,
    "is_available": true,
    "total_sessions": 156
}
```

**Error Responses:**

1. Invalid Token
```json
{
    "error": "Invalid token",
    "message": "Token has expired or is invalid"
}
```

2. Translator Not Found
```json
{
    "error": "Translator not found"
}
```

3. Server Error
```json
{
    "error": "Failed to search translators"
}
```

**Testing with Thunder Client:**

1. Search All Translators:
```http
GET http://localhost:8000/api/translators/search
Authorization: Bearer your_token_here
```

2. Search with Filters:
```http
GET http://localhost:8000/api/translators/search?language=es&location=Madrid&available=true&min_rating=4.5
Authorization: Bearer your_token_here
```

3. Get Translator Details:
```http
GET http://localhost:8000/api/translators/1
Authorization: Bearer your_token_here
```

#### Manage Bookings

##### Create Booking
```http
POST /api/bookings
```
**Headers Required:** `Authorization`

**Request Body:**
```json
{
    "translator_id": 1,
    "date": "2024-04-20",
    "start_time": "14:00",
    "duration_hours": 2,
    "location": "Tokyo Station",
    "notes": "Need help with shopping"
}
```

**Response (201):**
```json
{
    "booking_id": 1,
    "translator": {
        "id": 1,
        "full_name": "John Smith"
    },
    "status": "pending",
    "total_amount": 51.00,
    "date": "2024-04-20",
    "start_time": "14:00",
    "duration_hours": 2,
    "location": "Tokyo Station"
}
```

##### List Bookings
```http
GET /api/bookings
```
**Headers Required:** `Authorization`

**Query Parameters:**
```
status: string (optional) - Filter by status (pending/confirmed/completed/cancelled)
from_date: string (optional) - Start date in ISO format
to_date: string (optional) - End date in ISO format
```

**Response (200):**
```json
{
    "bookings": [
        {
            "booking_id": 1,
            "translator": {
                "id": 1,
                "full_name": "John Smith"
            },
            "status": "confirmed",
            "total_amount": 51.00,
            "date": "2024-04-20",
            "start_time": "14:00",
            "duration_hours": 2,
            "location": "Tokyo Station"
        }
    ],
    "total": 1,
    "page": 1,
    "per_page": 10
}
```

##### Get Booking Details
```http
GET /api/bookings/:id
```
**Headers Required:** `Authorization`

**Response (200):**
```json
{
    "booking_id": 1,
    "translator": {
        "id": 1,
        "full_name": "John Smith",
        "phone_number": "1234567890"
    },
    "status": "confirmed",
    "total_amount": 51.00,
    "date": "2024-04-20",
    "start_time": "14:00",
    "duration_hours": 2,
    "location": "Tokyo Station",
    "notes": "Need help with shopping",
    "created_at": "2024-04-14T10:30:00Z",
    "updated_at": "2024-04-14T10:30:00Z"
}
```

##### Update Booking
```http
PUT /api/bookings/:id
```
**Headers Required:** `Authorization`

**Request Body:**
```json
{
    "date": "2024-04-21",
    "start_time": "15:00",
    "duration_hours": 3,
    "location": "Shibuya Station",
    "notes": "Updated meeting point"
}
```

**Response (200):**
```json
{
    "booking_id": 1,
    "status": "updated",
    "message": "Booking updated successfully"
}
```

##### Cancel Booking
```http
DELETE /api/bookings/:id
```
**Headers Required:** `Authorization`

**Response (200):**
```json
{
    "booking_id": 1,
    "status": "cancelled",
    "message": "Booking cancelled successfully"
}
```

#### Chat System

##### Get Chat Messages
```http
GET /api/chat/:translatorId
```
**Headers Required:** `Authorization`

**Query Parameters:**
```
before: string (optional) - Get messages before this timestamp
limit: number (optional) - Number of messages to return (default: 50)
```

**Response (200):**
```json
{
    "messages": [
        {
            "id": 1,
            "sender_id": 1,
            "sender_type": "traveler",
            "content": "Hello, are you available tomorrow?",
            "created_at": "2024-04-14T10:30:00Z",
            "read_at": "2024-04-14T10:31:00Z"
        }
    ],
    "has_more": false
}
```

##### Send Message
```http
POST /api/chat/:translatorId
```
**Headers Required:** `Authorization`

**Request Body:**
```json
{
    "content": "Hello, are you available tomorrow?"
}
```

**Response (201):**
```json
{
    "message_id": 1,
    "status": "sent",
    "created_at": "2024-04-14T10:30:00Z"
}
```

#### Payments

##### Initiate Payment
```http
POST /api/payments/initiate
```
**Headers Required:** `Authorization`

**Request Body:**
```json
{
    "booking_id": 1,
    "payment_method": "card"
}
```

**Response (200):**
```json
{
    "payment_id": "pay_123",
    "amount": 51.00,
    "currency": "EUR",
    "client_secret": "pi_1234_secret_5678",
    "publishable_key": "pk_test_..."
}
```

##### Verify Payment
```http
POST /api/payments/verify
```
**Headers Required:** `Authorization`

**Request Body:**
```json
{
    "payment_intent_id": "pi_1234"
}
```

**Response (200):**
```json
{
    "status": "success",
    "booking_id": 1,
    "payment_id": "pay_123",
    "amount": 51.00
}
```

**Response (202) - Payment still processing:**
```json
{
    "status": "pending",
    "payment_intent_status": "processing",
    "message": "Payment has not completed yet"
}
```

##### Stripe Webhook (Server-to-Server)
```http
POST /api/payments/webhook
```
**Headers Required:** `Stripe-Signature`

**Response (200):**
```json
{
    "status": "success"
}
```

##### Test Cards for Sandbox
When testing payments in the sandbox environment, use these test card numbers:

- **Success:** 4242 4242 4242 4242
- **Authentication Required:** 4000 0025 0000 3155
- **Payment Failed:** 4000 0000 0000 9995

Use any future expiration date, any 3-digit CVC, and any postal code.

## Error Responses

### Common Error Formats
```json
{
    "error": "Error message here"
}
```

### Common Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (e.g., email already exists)
- 500: Internal Server Error

## Development Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up PostgreSQL database:
```bash
# Create database
createdb human_translator

# Run schema
psql -d human_translator -f table.sql
```

3. Run server:
```bash
python app.py
```
