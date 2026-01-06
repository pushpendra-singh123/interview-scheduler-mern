# Automatic Interview Scheduling – MERN Stack

## Architecture

- MongoDB: Slot + User storage
- Express + Node.js: REST APIs
- React: UI

## Data Model

- `User`: stores candidate identity (`name`, unique `email`).
- `Slot`: stores slot window (`startTime`, `endTime`, `maxCandidates`) and booking state.
  - `bookings[]`: stores per-booking info (`email`, `name`, `user` reference, `bookedAt`).
  - `bookedCount`: derived from `bookings.length`.

## APIs

### Slots

- GET `/api/slots` – List all slots
- POST `/api/slots` – Create a slot
- PATCH `/api/slots/:id` – Update a slot
- POST `/api/slots/book/:id` – Book a slot (requires existing user)
- POST `/api/slots/unbook/:id` – Remove a booking (requires existing user)

### Users

- POST `/api/users` – Create a user (`name`, `email`)

## Booking Rules

- Booking requires an existing user: the booking request must include an `email` that already exists in the `User` collection.
- Duplicate booking prevention: a user cannot book the same slot twice (checked by normalized email).
- Capacity enforcement: bookings are rejected once `bookings.length >= maxCandidates`.

## Future Enhancements

- Cursor-based pagination
- JWT Auth
