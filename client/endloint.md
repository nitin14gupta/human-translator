Here’s a clean and professional **README**-style documentation for your **Traveler & Translator API Endpoints**:

---

# 🌍 Traveler & Translator API Documentation

This API powers the backend of a multilingual travel assistance platform, enabling travelers to book translators, communicate in real time, and manage sessions with secure payments.

---

## 🔹 Traveler API Endpoints

| Endpoint | Method | Purpose | Description |
|---------|--------|---------|-------------|
| `/api/translators/search` | GET | Find available translators | Filters translators based on language, location, and date. |
| `/api/bookings` | POST | Create booking | Used when a traveler books a translator with session details (date, hours, location). |
| `/api/bookings` | GET | List all bookings | Returns all upcoming and past sessions for the traveler. |
| `/api/bookings/:id` | GET/PUT/DELETE | View/update/cancel a booking | Allows rescheduling or canceling an existing session. |
| `/api/chat/:translatorId` | GET/POST | Get or send messages | In-app chat system between traveler and translator. |
| `/api/translation/ai` | POST | AI-powered translation | Provides instant AI speech/text translation when no human translator is available. |
| `/api/payments/initiate` | POST | Initiate payment | Starts a transaction when booking a translator. |
| `/api/payments/verify` | POST | Verify payment | Verifies payment status via payment gateway callback. |

---

## 🔹 Translator API Endpoints

| Endpoint | Method | Purpose | Description |
|---------|--------|---------|-------------|
| `/api/translators/availability` | POST/PUT | Set or update availability | Sets or modifies working hours/calendar. |
| `/api/requests` | GET | View new booking requests | Lists incoming session requests to accept or decline. |
| `/api/requests/:id/accept` | POST | Accept a request | Accepts a session request from a traveler. |
| `/api/requests/:id/reject` | POST | Reject a request | Rejects the session if unavailable. |
| `/api/bookings` | GET | View all confirmed bookings | Lists all scheduled sessions (shown in Home tab). |
| `/api/chat/:travelerId` | GET/POST | Send or receive chat messages | Messaging system for coordination with traveler. |
| `/api/earnings` | GET | Fetch total earnings | Displays total earnings in “Earnings” tab. |
| `/api/earnings/withdraw` | POST | Withdraw money | Transfers earnings to translator’s bank/UPI account. |
| `/api/reviews/:bookingId` | POST | Leave a review | Traveler or translator can leave a review post-session. |

---

### 📌 Notes
- All endpoints requiring authentication must include a valid JWT token in the `Authorization` header.
- Time-based fields (bookings, availability) should follow ISO 8601 format.
- Chat endpoints support real-time messaging via polling or WebSocket (depending on frontend implementation).
- Payments are handled via a third-party payment gateway and must be verified post-initiation.

---

Let me know if you want this as a markdown file (`README.md`) or need Swagger/OpenAPI docs next.