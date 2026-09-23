# Implementation Documentation

## 1. Assignment Overview

This project implements the **Competition Details** screen for the Feedants Technical Assignment. It is a full-stack mobile application where users can view competition information, register for competitions, and submit entries — all driven by a real backend and database.

## 2. Requirements

- React Native frontend (Expo)
- Node.js/Express backend
- MongoDB database
- JWT authentication
- Competition lifecycle management
- Concurrent-safe registration
- Dynamic UI based on competition state
- Input validation and security

## 3. Architecture

```
┌─────────────────┐       HTTP/JSON       ┌─────────────────┐       Mongoose       ┌─────────────────┐
│   React Native  │ ◄──────────────────► │  Express Server  │ ◄──────────────────► │    MongoDB      │
│   (Expo)        │                       │  (Node.js)       │                       │                 │
└─────────────────┘                       └─────────────────┘                       └─────────────────┘
```

The frontend communicates with the backend via REST API calls. The backend handles all business logic, authentication, and database operations. MongoDB stores users, competitions, and participation records.

## 4. Folder Structure

```
Internship_Project/
├── mobile/                    # React Native app
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── screens/           # Screen components
│   │   ├── navigation/        # React Navigation setup
│   │   ├── services/          # API calls
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Helper functions
│   │   └── constants/         # Colors, API URL, etc.
│   ├── assets/
│   ├── App.js
│   └── package.json
├── server/                    # Express backend
│   ├── src/
│   │   ├── config/            # DB connection, environment
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, error handling
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # Route definitions
│   │   ├── services/          # Business logic
│   │   ├── validators/        # Input validation
│   │   └── utils/             # Helpers
│   ├── seed.js
│   ├── server.js
│   └── package.json
├── docs/
│   ├── IMPLEMENTATION.md
│   └── FINAL_AUDIT.md
├── README.md
├── .gitignore
└── .env.example
```

## 5. Database Schema

### User

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| name | String | Required, 2-100 chars | Trimmed |
| email | String | Required, unique, lowercase | Validated with regex |
| password | String | Required, min 6 chars | Hashed with bcrypt (10 rounds), excluded from queries via `select: false` |
| avatar | String | Optional | Profile image URL |
| createdAt | Date | Auto | Mongoose timestamps |
| updatedAt | Date | Auto | Mongoose timestamps |

**Indexes:** `email` (unique)

### Competition

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| title | String | Required, max 200 | Competition name |
| category | String | Required | e.g. "Design", "Coding" |
| type | String | Enum: Individual/Team | Default: Individual |
| description | String | Required, max 5000 | Full description |
| coverImage | String | Optional | Cover image URL |
| prizePool | String | Required | e.g. "₹50,000" |
| entryFee | Number | Required, min 0 | 0 = free entry |
| capacity | Number | Required, min 1 | Max participants |
| registeredCount | Number | Default 0, min 0 | Updated atomically during registration |
| registrationStart | Date | Required | When registration opens |
| registrationEnd | Date | Required | When registration closes |
| submissionStart | Date | Required | When submissions open |
| submissionEnd | Date | Required | Submission deadline |
| resultDate | Date | Required | When results are declared |
| judge | Object | Required | `{ name, title, avatar }` |
| judgingParameters | Array | — | `[{ name, weightage, description }]` |
| rules | Array[String] | — | Competition rules |
| eligibility | Array[String] | — | Eligibility criteria |
| rewards | Array | — | `[{ rank, title, prize }]` |
| previousWinners | Array | — | `[{ name, rank, prize, avatar }]` |
| status | String | Enum | Stored status, can be overridden by `computeStatus()` |

**Indexes:** `status`, `category`

**`computeStatus()` method:** Derives the current state from server time. CANCELLED and RESULT_DECLARED are manual overrides; all other states are computed from dates.

### Participation

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| userId | ObjectId | Required, ref: User | Who registered |
| competitionId | ObjectId | Required, ref: Competition | Which competition |
| status | String | Enum: REGISTERED/SUBMITTED/WINNER/DISQUALIFIED | Default: REGISTERED |
| registeredAt | Date | Default: now | When the user registered |
| submission | Object | Optional | `{ title, description, fileUrl, linkUrl }` |
| submittedAt | Date | Optional | When submission was made |

**Indexes:**
- `{ userId, competitionId }` — **compound unique index** (prevents duplicate registrations at DB level)
- `{ competitionId }` — for querying all participants of a competition

### Why the compound unique index on Participation?

The unique index on `(userId, competitionId)` is critical for concurrency safety. Without it, two simultaneous registration requests from the same user could both pass the application-level "already registered?" check and insert duplicate documents. With the index, MongoDB enforces uniqueness at the storage engine level — the second insert fails with error code 11000, which we catch and return as "already registered".

## 6. API Endpoints

### Auth Endpoints

| Method | Endpoint | Auth | Rate Limited | Description |
|--------|----------|------|-------------|-------------|
| POST | `/api/auth/register` | No | Yes (20/15min) | Create a new user account |
| POST | `/api/auth/login` | No | Yes (20/15min) | Login and receive JWT |
| GET | `/api/auth/me` | Yes | No | Get current user profile |

### Competition Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/competitions/:id` | Optional | Get competition details + user participation |
| POST | `/api/competitions/:id/register` | Required | Register for a competition |
| POST | `/api/competitions/:id/submission` | Required | Submit an entry |

### Response Format

All endpoints return consistent JSON:

Success: `{ "success": true, "data": { ... } }`

Error: `{ "success": false, "message": "...", "code": "ERROR_CODE" }`

## 7. Authentication

- Passwords are hashed using bcryptjs with 10 salt rounds via a Mongoose pre-save hook.
- Passwords are excluded from queries by default (`select: false`) and stripped from JSON output.
- JWT tokens are signed with a secret from the `JWT_SECRET` environment variable.
- Tokens contain the user ID and expire after `JWT_EXPIRES_IN` (default: 7 days).
- The `auth` middleware extracts the token from `Authorization: Bearer <token>`, verifies it, and attaches `req.user`.
- The `optionalAuth` middleware does the same but silently continues if no token is present.
- Auth endpoints are rate-limited to 20 requests per 15-minute window to prevent brute-force attacks.
- Login returns the same error message for wrong email and wrong password ("Invalid email or password") to prevent user enumeration.

## 8. Competition Lifecycle

The competition moves through 7 discrete states driven by server-authoritative timestamps, avoiding client clock tampering:

```
[ UPCOMING ]
     │ (registrationStart reached)
     ▼
[ REGISTRATION_OPEN ] ───────────► [ REGISTRATION_CLOSED ] (if capacity reached)
     │ (registrationEnd reached)
     ▼
[ REGISTRATION_CLOSED ]
     │ (submissionStart reached)
     ▼
[ SUBMISSION_OPEN ]
     │ (submissionEnd reached)
     ▼
[ SUBMISSION_CLOSED ]
     │ (resultDate reached)
     ▼
[ RESULT_DECLARED ]
```

*Note: `CANCELLED` and `RESULT_DECLARED` can also be set as manual overrides by admins at any time.*

### State Derivation Logic (`computeStatus` method)
1. **Manual Override Check**: If `status === 'CANCELLED'` or `'RESULT_DECLARED'`, return immediately.
2. **Current Time Evaluation**:
   - `now < registrationStart` → `UPCOMING`
   - `registrationStart <= now <= registrationEnd`:
     - If `registeredCount >= capacity` → `REGISTRATION_CLOSED`
     - Else → `REGISTRATION_OPEN`
   - `registrationEnd < now < submissionStart` → `REGISTRATION_CLOSED`
   - `submissionStart <= now <= submissionEnd` → `SUBMISSION_OPEN`
   - `submissionEnd < now < resultDate` → `SUBMISSION_CLOSED`
   - `now >= resultDate` → `RESULT_DECLARED`

## 9. Registration Logic & Concurrency

### The Race Condition Problem
In high-demand competitions, multiple users may attempt to register for the final available spot at the exact same millisecond. A naive `SELECT` followed by `INSERT` pattern produces race conditions where:
- User A checks: 19/20 spots filled (1 left).
- User B checks simultaneously: 19/20 spots filled (1 left).
- Both proceed to register.
- Result: 21 participants registered for a 20-person capacity (oversold).

### Two-Tier Concurrency Defense
1. **Atomic Conditional Increment (`findOneAndUpdate`)**:
   ```javascript
   const updated = await Competition.findOneAndUpdate(
     {
       _id: competitionId,
       registeredCount: { $lt: competition.capacity }
     },
     { $inc: { registeredCount: 1 } },
     { new: true }
   );
   ```
   MongoDB's document-level write lock ensures that only one operation can evaluate `{ registeredCount: { $lt: capacity } }` and apply `$inc: 1` at a time. The 21st user will receive `null`, immediately failing with `COMPETITION_FULL`.

2. **Compound Unique Index on `Participation`**:
   `{ userId: 1, competitionId: 1 }` with `{ unique: true }`.
   If a user sends duplicate clicks or concurrent requests, the database rejects the second write with MongoDB error code `11000`. The server catches `11000`, rolls back the increment via `$inc: { registeredCount: -1 }`, and returns an HTTP 409 `ALREADY_REGISTERED`.

## 10. Validation

Input validation uses `express-validator` middleware chains:

- **Auth register**: name (2-100 chars), email (valid format, normalized), password (min 6 chars)
- **Auth login**: email (valid format), password (present)
- **Competition ID**: valid MongoDB ObjectId format (`mongoose.Types.ObjectId.isValid`)
- **Submission**: title (required, max 200), description (optional, max 2000), linkUrl (optional, valid URL)

Validation errors return the first error message with code `VALIDATION_ERROR` and HTTP 400.

## 11. Security Hardening

- **Password Security**: Passwords hashed using bcryptjs with 10 salt rounds. Schemas use `select: false` on the password field and sanitize JSON serialization via custom `toJSON` method.
- **JWT Protection**: Tokens signed with an environment secret (`JWT_SECRET`) and a 7-day expiration. Verified on protected routes with custom auth middleware.
- **HTTP Headers**: Helmet middleware enabled to apply secure headers (CSP, HSTS, X-Content-Type-Options, etc.).
- **CORS Management**: Restricted origin support configurable via `CORS_ORIGIN`.
- **Rate Limiting**: Protects auth endpoints against brute-force attacks (max 20 requests per 15 minutes per IP).
- **Injection Mitigation**: Strong schema typing via Mongoose, pre-validating ObjectId parameters before DB lookups.
- **Zero Information Leakage**: Error stacks are suppressed from client responses in non-development environments; generic credential error messages prevent user enumeration.

## 12. Frontend States

The Competition Details screen handles all lifecycle and network states:
- **Loading State**: ActivityIndicator with informative status while fetching data.
- **Error & Retry State**: Graceful error cards with actionable "Retry" buttons if the network or server fails.
- **Pull-to-Refresh**: Native `RefreshControl` allows users to pull down at any time to re-sync with server state.
- **Dynamic Bottom Action Button**:
  - `UPCOMING`: "Registration Not Open Yet" (disabled)
  - `REGISTRATION_OPEN` (not logged in): "Login to Register" (navigates to Login)
  - `REGISTRATION_OPEN` (logged in, spots available): "Register Now (X spots left)" (active)
  - `REGISTRATION_OPEN` (logged in, already registered): "✓ Already Registered" (success state)
  - `REGISTRATION_OPEN` (capacity full): "Competition Full" (disabled)
  - `REGISTRATION_CLOSED`: "Registration Closed"
  - `SUBMISSION_OPEN` (registered, not submitted): "Submit Entry" (opens submission modal)
  - `SUBMISSION_OPEN` (submitted): "✓ Submitted" (success state)
  - `SUBMISSION_OPEN` (not registered): "Not Registered" (disabled)
  - `SUBMISSION_CLOSED`: "Submission Closed"
  - `RESULT_DECLARED`: "Results Declared"
  - `CANCELLED`: "Competition Cancelled"

## 13. Countdown Component

- **Real-Time Client Calculation**: `CountdownCard` calculates remaining days, hours, minutes, and seconds every 1000ms.
- **Server Timestamp Synchronization**: Target dates are sourced directly from server competition records (`registrationStart`, `registrationEnd`, `submissionStart`, `submissionEnd`, `resultDate`).
- **Auto-Expiration Trigger**: When the countdown reaches `00:00:00:00`, it automatically invokes the `onExpired` callback, triggering a background refresh of the competition details to seamlessly transition the UI to the next lifecycle phase.

## 14. Submission Flow

1. Registered users during `SUBMISSION_OPEN` tap "Submit Entry".
2. A native Modal opens with fields for:
   - Project Title (required, max 200 characters)
   - Project Description (optional, max 2000 characters)
   - Project Link / Demo URL (optional, validated URL)
3. Upon submission:
   - Client sends `POST /api/competitions/:id/submission`.
   - Server verifies user registration and checks that submission deadline has not passed.
   - Participation status updates to `SUBMITTED` with `submittedAt` timestamp.
   - UI updates dynamically to show "✓ Submitted" button state.

## 15. Error Handling

A centralized error handler (`errorHandler.js`) catches all errors:

- **Mongoose ValidationError** → 400 with field-level messages
- **Duplicate key (11000)** → 409 "Duplicate entry"
- **CastError** → 400 "Invalid ID format"
- **JsonWebTokenError** → 401 "Invalid token"
- **TokenExpiredError** → 401 "Token expired"
- **Other errors** → uses `err.statusCode` or defaults to 500

Stack traces and internal details are never exposed to the client.

## 16. Testing

### Automated Test Suite (`npm test`)
Built using Node's native test runner (`node:test` and `node:assert`):
- **Lifecycle Suite (`competitionLifecycle.test.js`)**: 9 tests verifying all state machine transitions and manual overrides.
- **Auth Suite (`auth.test.js`)**: 5 tests validating bcrypt hashing, verification, toJSON sanitization, and JWT expiry.
- **Concurrency Suite (`concurrency.test.js`)**: 4 tests verifying compound unique indexes, capacity clamping, and rollback mechanics.
- **Error Handler Suite (`errorHandler.test.js`)**: 5 tests ensuring all HTTP error status codes and masked payloads match specifications.

### Concurrency Stress Test (`node test-concurrency.js`)
Standalone simulation testing 15 simultaneous requests against a 5-capacity competition to verify zero overselling and compound unique index deduplication.

## 17. Assumptions

- MongoDB Atlas connection string is provided in `server/.env`.
- Mobile client communicates with backend over local network or localhost via `API_BASE_URL`.
- Payment is mocked (zero fee or entry pass).
- Submissions accept external links (Figma, GitHub, Loom) and metadata.

## 18. Technical Decisions

1. **State Machine on Model vs Cron Jobs**: Rather than running scheduled cron jobs to update database status flags every minute, `computeStatus()` derives state dynamically upon retrieval using server clock. This guarantees 100% accurate status without cron drift.
2. **Atomic Updates over Distributed Locks**: `findOneAndUpdate` with query-level condition avoids the need for external distributed locking systems (such as Redis Redlock) while providing strict ACID guarantees within MongoDB.
3. **Rollback over Multi-Document Transactions**: For deployments using standalone MongoDB instances or shared tier clusters where replica set transactions may not be configured, conditional atomic increment with rollback on duplicate write provides optimal compatibility and reliability.

## 19. Trade-offs

- **Derived Status vs Stored Status Querying**: Deriving status on read allows instant state transitions, but querying by status in bulk queries requires computing the date ranges. We addressed this by combining indexed date boundaries with stored status fields.
- **In-Memory Rate Limiting**: The built-in rate limiter uses memory storage. For a multi-node cluster, a Redis store would be swapped in.

## 20. Future Improvements

- Cloud storage for direct file uploads (AWS S3 / Cloudinary).
- Push notifications via Expo Notifications for deadline alerts.
- Live real-time spot updates via WebSockets or Server-Sent Events.
- Admin dashboard to manage and score submissions.
