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
  - `bookings[]`: stores per-booking info (`user` reference, `bookedAt`).
  - `bookedCount`: derived from `bookings.length`.

## APIs

### Auth

- POST `/api/auth/signup`
  - Creates an account and returns `{ token, user }`
  - For admin signup, client must send `role: "admin"` and `adminSecret` which must match `ADMIN_SIGNUP_SECRET` in the backend environment
- POST `/api/auth/login`
  - Logs in and returns `{ token, user }`

Note: The frontend persists `{ token, user }` in localStorage and initializes auth from storage on reload (no `/me` endpoint).

### Slots

- GET `/api/slots` – List all slots
- POST `/api/slots/createSlot` – Create a slot (admin only)
- PATCH `/api/slots/update/:id` – Update a slot (admin only)
- POST `/api/slots/book/:id` – Book a slot (authenticated user only)
- POST `/api/slots/unbook/:id` – Remove a booking (authenticated user only)

## Booking Rules

- Booking requires authentication: booking uses the authenticated user identity from the JWT.
- Duplicate booking prevention: a user cannot book the same slot twice (checked by authenticated user id).
- Capacity enforcement: bookings are rejected once `bookings.length >= maxCandidates`.
- "One slot per candidate" is enforced globally (unique index on `bookings.user`).

## Future Enhancements

- Cursor-based pagination
- Rate limiting for auth endpoints (especially admin signup)
- Disable admin signup after first admin exists OR switch to invite-based admin provisioning
