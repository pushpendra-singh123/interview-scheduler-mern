
# Automatic Interview Scheduling – MERN Stack

## Architecture
- MongoDB: Slot storage
- Express + Node.js: REST APIs
- React: UI

## APIs
GET /api/slots – List available slots  
POST /api/slots/book/:id – Book slot with race condition check

## Race Condition Handling
- Atomic updates via MongoDB document locking

## Future Enhancements
- Cursor-based pagination
- JWT Auth
- Debouncing on booking
