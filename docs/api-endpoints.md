# Booking Management

## Get User Bookings

Returns all bookings for the current authenticated user, filtered by status if provided.

**URL**: `/api/bookings`

**Method**: `GET`

**Auth required**: Yes (JWT Bearer token)

**Query Parameters**:
- `status` (optional): Filter bookings by status. Valid values are:
  - `upcoming`: Pending or confirmed bookings with dates in the future
  - `past`: Completed or cancelled bookings, or bookings with dates in the past
  - `completed`: Only completed bookings
  - `cancelled`: Only cancelled bookings

**Success Response**:
- **Code**: 200 OK
- **Content**: Array of booking objects
```json
[
  {
    "id": 1,
    "date": "2023-06-10",
    "formatted_date": "Jun 10",
    "time": "14:00",
    "formatted_time": "14:00 - 16:00",
    "duration_hours": 2,
    "location": "Eiffel Tower",
    "notes": "Meet at the entrance",
    "status": "confirmed",
    "amount": 90.0,
    "other_user_id": 2,
    "other_user_name": "Sarah Martin",
    "other_user_photo": "https://example.com/photo.jpg",
    "created_at": "2023-06-01T10:30:00.000Z",
    "updated_at": "2023-06-01T10:30:00.000Z"
  }
]
```

**Error Response**:
- **Code**: 401 Unauthorized
- **Content**: `{ "error": "Authentication failed" }`

OR

- **Code**: 500 Internal Server Error
- **Content**: `{ "error": "Failed to get bookings" }`

## Get Booking Details

Returns details for a specific booking.

**URL**: `/api/bookings/:id`

**Method**: `GET`

**Auth required**: Yes (JWT Bearer token)

**URL Parameters**:
- `id`: ID of the booking to retrieve

**Success Response**:
- **Code**: 200 OK
- **Content**: Booking object
```json
{
  "id": 1,
  "date": "2023-06-10",
  "formatted_date": "Jun 10",
  "time": "14:00",
  "formatted_time": "14:00 - 16:00",
  "duration_hours": 2,
  "location": "Eiffel Tower",
  "notes": "Meet at the entrance",
  "status": "confirmed",
  "amount": 90.0,
  "other_user_id": 2,
  "other_user_name": "Sarah Martin",
  "other_user_photo": "https://example.com/photo.jpg",
  "created_at": "2023-06-01T10:30:00.000Z",
  "updated_at": "2023-06-01T10:30:00.000Z"
}
```

**Error Response**:
- **Code**: 401 Unauthorized
- **Content**: `{ "error": "Authentication failed" }`

OR

- **Code**: 404 Not Found
- **Content**: `{ "error": "Booking not found" }`

OR

- **Code**: 403 Forbidden
- **Content**: `{ "error": "Unauthorized" }`

## Create Booking

Creates a new booking. Only travelers can create bookings.

**URL**: `/api/bookings`

**Method**: `POST`

**Auth required**: Yes (JWT Bearer token)

**Request Body**:
```json
{
  "translator_id": 2,
  "date": "2023-06-10",
  "start_time": "14:00",
  "duration_hours": 2,
  "location": "Eiffel Tower",
  "total_amount": 90.0,
  "notes": "Meet at the entrance"
}
```

**Success Response**:
- **Code**: 201 Created
- **Content**: Created booking object
```json
{
  "id": 1,
  "traveler_id": 1,
  "translator_id": 2,
  "date": "2023-06-10",
  "time": "14:00",
  "duration_hours": 2,
  "location": "Eiffel Tower",
  "notes": "Meet at the entrance",
  "status": "pending",
  "amount": 90.0,
  "created_at": "2023-06-01T10:30:00.000Z",
  "updated_at": "2023-06-01T10:30:00.000Z"
}
```

**Error Response**:
- **Code**: 401 Unauthorized
- **Content**: `{ "error": "Authentication failed" }`

OR

- **Code**: 403 Forbidden
- **Content**: `{ "error": "Only travelers can create bookings" }`

OR

- **Code**: 400 Bad Request
- **Content**: `{ "error": "Missing required fields: translator_id, date, start_time, duration_hours, location, total_amount" }`

## Update Booking

Updates a booking. Currently supports three actions: cancel, complete, and reschedule.

**URL**: `/api/bookings/:id`

**Method**: `PUT`

**Auth required**: Yes (JWT Bearer token)

**URL Parameters**:
- `id`: ID of the booking to update

**Request Body**:
For cancellation:
```json
{
  "action": "cancel"
}
```

For completion:
```json
{
  "action": "complete"
}
```

For rescheduling:
```json
{
  "action": "reschedule",
  "date": "2023-06-15",
  "start_time": "16:00",
  "duration_hours": 3,
  "location": "Louvre Museum",
  "notes": "Meet at the pyramid entrance"
}
```

**Success Response**:
- **Code**: 200 OK
- **Content**: Updated booking object
```json
{
  "id": 1,
  "traveler_id": 1,
  "translator_id": 2,
  "date": "2023-06-15",
  "time": "16:00",
  "duration_hours": 3,
  "location": "Louvre Museum",
  "notes": "Meet at the pyramid entrance",
  "status": "confirmed",
  "amount": 90.0,
  "created_at": "2023-06-01T10:30:00.000Z",
  "updated_at": "2023-06-05T14:20:00.000Z"
}
```

**Error Response**:
- **Code**: 401 Unauthorized
- **Content**: `{ "error": "Authentication failed" }`

OR

- **Code**: 404 Not Found
- **Content**: `{ "error": "Booking not found" }`

OR

- **Code**: 403 Forbidden
- **Content**: `{ "error": "Unauthorized" }`

OR

- **Code**: 400 Bad Request
- **Content**: `{ "error": "Invalid action" }` or `{ "error": "Cannot cancel booking with status completed" }` 