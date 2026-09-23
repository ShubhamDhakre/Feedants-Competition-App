# Quick Start Guide — Feedants Competition App

This guide contains the exact step-by-step instructions to set up, seed, run, and test both the backend server and the mobile application.

---

## 📋 Prerequisites

Before running the application, make sure you have:
- **Node.js**: v18 or newer (`node -v`)
- **npm**: v9 or newer (`npm -v`)
- **MongoDB**: MongoDB Atlas connection string (or local MongoDB running)
- **Expo Go App**: Installed on your phone (Android / iOS) **OR** a modern Web Browser (Chrome, Firefox, Brave)

---

## 🛠️ Step 1: Backend Setup & Configuration

Open **Terminal 1**:

```bash
cd server
npm install
```

### Environment Variables (`server/.env`)
Verify `server/.env` contains your connection settings:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=dev_secret_change_in_production_abc123
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

---

## 🌱 Step 2: Seed the Database

Populate MongoDB with the test competition and pre-created user accounts:

```bash
cd server
npm run seed
```

You should see:
```text
Connected to MongoDB
Cleared existing data
Created 3 test users
Created competition: UI/UX Design Challenge 2024
Computed status: REGISTRATION_OPEN
```

### Pre-Seeded Test Credentials
| Name | Email | Password | Role |
|---|---|---|---|
| John Doe | `john@example.com` | `password123` | Eligible to register |
| Jane Smith | `jane@example.com` | `password123` | Eligible to register |
| Alex Kumar | `alex@example.com` | `password123` | Eligible to register |

---

## 🚀 Step 3: Start the Backend Server

In **Terminal 1**, start the server:

```bash
cd server
npm run dev
```

You should see:
```text
Server running on port 5000 in development mode
MongoDB connected: ...
```

*Health check endpoint:* `http://localhost:5000/api/health`

---

## 📱 Step 4: Mobile App Setup & Launch

Open **Terminal 2**:

```bash
cd mobile
npm install
```

### 1. Network Configuration
Open [`mobile/src/constants/api.js`](file:///media/shubhamdhakre/New%20Volume/Internship_Project/mobile/src/constants/api.js):

- **If testing on Web Browser (`w`) on your computer**:
  ```javascript
  export const API_BASE_URL = 'http://localhost:5000/api';
  ```
- **If testing on a Physical Phone via Expo Go app**:
  Use your computer's local Wi-Fi IP address (check terminal or run `ip addr` / `ipconfig`):
  ```javascript
  export const API_BASE_URL = 'http://10.0.3.77:5000/api'; // replace with your current Wi-Fi IP
  ```
  *(Ensure both phone and computer are on the same Wi-Fi network).*
- **If testing on Android Emulator**:
  ```javascript
  export const API_BASE_URL = 'http://10.0.2.2:5000/api';
  ```

### 2. Start Expo
In **Terminal 2**, start Metro bundler:

```bash
cd mobile
npx expo start
```

### 3. Open the Application

Choose whichever option suits your environment:

- **Option A: Web Browser (Instant on PC)**
  Press **`w`** in the Expo terminal. The app will open directly in your web browser.
- **Option B: Physical Phone (Expo Go)**
  1. Open the **Expo Go** app on your phone.
  2. Scan the QR code displayed in the terminal.
- **Option C: Android / iOS Emulator**
  - Press **`a`** for Android (requires Android Studio & SDK installed with `adb` in PATH).
  - Press **`i`** for iOS Simulator (requires macOS & Xcode).

---

## 🧪 Step 5: Run Automated Tests

Open a new terminal to run the test suite:

### 1. Backend Unit Tests (23/23 tests)
```bash
cd server
npm test
```
*Covers authentication, state machine transitions, concurrency bounds, and centralized error handling.*

### 2. Concurrency Race Condition Simulation
```bash
cd server
node test-concurrency.js
```
*Simulates 15 simultaneous requests competing for 5 spots, and 5 concurrent requests from the same user to verify atomic isolation and compound unique index enforcement.*

---

## 🎯 Verification & Demo Walkthrough

1. **Competition Screen**: Displays "UI/UX Design Challenge 2024" loaded dynamically from MongoDB. Shows Hero, Stats bar, live Countdown timer, Timeline, Judging criteria, Rules, Rewards, and Winners.
2. **Dynamic Countdown**: Synced with server dates; updates every second.
3. **Unauthenticated State**: Bottom button displays `"Login to Register"`.
4. **Login Flow**: Tap `"Login to Register"`, log in with `john@example.com` / `password123`.
5. **Registration Flow**: Button dynamically changes to `"Register Now (20 spots left)"`. Tap to register.
6. **Registered State**: Button dynamically updates to `"✓ Already Registered"` and remaining spots decrement to 19.
7. **Pull-to-Refresh**: Drag down from top to trigger `RefreshControl` and re-fetch real-time database state.

---

## ❓ Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| `Error: spawn adb ENOENT` | Android SDK is not installed or not in PATH | Either use **Expo Go on your physical phone** (scan QR code) or press **`w`** to test in the **Web Browser**. |
| `Network Error` on phone | Phone cannot reach the backend server | 1. Ensure phone & PC are on the same Wi-Fi.<br>2. Update `API_BASE_URL` in `mobile/src/constants/api.js` to your machine's Wi-Fi IP (e.g. `http://10.0.3.77:5000/api`). |
| `MongoNetworkError` | MongoDB Atlas IP not whitelisted | In MongoDB Atlas console → **Network Access** → Add `0.0.0.0/0` (Allow access from anywhere). |
| Port 5000 already in use | Another process is occupying port 5000 | Kill process: `lsof -ti:5000 \| xargs kill -9` or change `PORT=5001` in `server/.env`. |
| "No competitions found" in app | Database has not been seeded | Run `npm run seed` inside the `server/` directory. |
