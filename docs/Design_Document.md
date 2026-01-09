# Automatic Interview Scheduling – MERN Stack

## Architecture

- MongoDB: Slot + User storage
- Express + Node.js: REST APIs
- React: UI

## Data Model

- `User`: stores account identity and access control
  - `name`
  - unique `email`
  - `passwordHash` (bcrypt)
  - `role`: `user` (candidate) or `admin` (interviewer)
- `Slot`: stores slot window (`startTime`, `endTime`, `maxCandidates`) and booking state.
  - `bookings[]`: stores per-booking info (`email`, `name`, `user` reference, `bookedAt`).
  - `bookedCount`: derived from `bookings.length`.

## APIs

### Auth

- POST `/api/auth/signup`
  - Creates an account and returns `{ token, user }`
  - For admin signup, client must send `role: "admin"` and `adminSecret` which must match `ADMIN_SIGNUP_SECRET` in the backend environment
- POST `/api/auth/login`
  - Logs in and returns `{ token, user }`
- GET `/api/auth/me`
  - Returns current authenticated user (requires `Authorization: Bearer <token>`)

### Slots

- GET `/api/slots` – List all slots
- POST `/api/slots` – Create a slot (admin only)
- PATCH `/api/slots/:id` – Update a slot (admin only)
- POST `/api/slots/book/:id` – Book a slot (authenticated user only)
- POST `/api/slots/unbook/:id` – Remove a booking (authenticated user only)

### Users (legacy)

- POST `/api/users` – Deprecated (use `/api/auth/signup`)

## Booking Rules

- Booking requires authentication: booking uses the authenticated user identity from the JWT.
- Duplicate booking prevention: a user cannot book the same slot twice (checked by normalized email).
- Capacity enforcement: bookings are rejected once `bookings.length >= maxCandidates`.
- "One slot per candidate" is enforced globally (unique index on `bookings.email`).

## Future Enhancements

- Cursor-based pagination
- Rate limiting for auth endpoints (especially admin signup)
- Disable admin signup after first admin exists OR switch to invite-based admin provisioning
