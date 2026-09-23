# Feedants Competition Details — Full Stack Application

A full-stack mobile application built for the Feedants Technical Assignment. It implements a **Competition Details** screen with real backend logic, database-driven data, and safe concurrent registration.

## Features

- Competition Details screen (React Native)
- User authentication (register, login, JWT)
- Competition lifecycle management (state machine)
- Concurrent-safe registration (atomic MongoDB operations)
- Submission flow
- Countdown timer with server-authoritative timestamps
- Dynamic UI states based on backend data
- Input validation and security hardening

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native, Expo, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |

## Prerequisites

- Node.js >= 18
- npm >= 9
- MongoDB (local or Atlas)
- Expo CLI (`npx expo`)
- Android/iOS emulator or Expo Go app on a physical device

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd Internship_Project
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file in `server/` (see `.env.example` in the project root):

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb: MONGO_URL
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

### 3. Seed the database

```bash
cd server
node seed.js
```

### 4. Start the backend

```bash
cd server
npm run dev
```

The server runs on `http://localhost:5000`.

### 5. Mobile setup

```bash
cd mobile
npm install
```

### 6. Start the mobile app

```bash
cd mobile
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

> **Note:** Update the API base URL in `mobile/src/constants/api.js` to match your local network IP if testing on a physical device.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/competitions/:id` | No | Get competition details |
| POST | `/api/competitions/:id/register` | Yes | Register for a competition |
| POST | `/api/competitions/:id/submission` | Yes | Submit entry |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | "MONGODB_URL" |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |

## Testing

```bash
cd server
npm test
```

## Assumptions & Technical Decisions

- Competition state is determined server-side based on dates — the client never decides state.
- Atomic `findOneAndUpdate` with conditions is used for registration to prevent race conditions.
- A compound unique index on `(userId, competitionId)` prevents duplicate registrations.
- JWT tokens are stored in AsyncStorage on the mobile client.
- Payment is mocked — no real payment gateway is integrated.
- File uploads use local storage — a production app would use cloud storage.

## Security

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT authentication on protected routes
- Input validation on all endpoints
- Helmet for HTTP security headers
- Rate limiting on auth endpoints
- MongoDB operator injection prevention
- No secrets in source code — `.env` is gitignored

## Future Improvements

- Push notifications for competition updates
- Real payment gateway integration
- Cloud file storage (S3/GCS) for submissions
- Pagination for competition listings
- Admin panel for competition management
- Automated testing pipeline (CI/CD)

## License

This project is an assignment submission and is not licensed for commercial use.
