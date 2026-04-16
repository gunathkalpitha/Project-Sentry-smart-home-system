# Project Sentry - Smart Home IoT System

Project Sentry is a full-stack smart home monitoring and control platform.
It combines a React dashboard, a Node.js API, real-time Socket.IO updates, and ESP32 telemetry to help monitor power usage, WiFi state, and home security events.

Project page: https://gunathkalpitha.github.io/IoT-sentry-project/
 
## Highlights

- Real-time device status and sensor readings via Socket.IO
- JWT-based authentication with email/password and Google sign-in endpoint
- ESP32 ingestion endpoint for current and voltage telemetry
- Device management with safety limits and remote toggling
- Dedicated modules for WiFi, security, environmental monitoring, and reports
- Raspberry Pi integration endpoints for edge management

## Tech Stack

Frontend
- React 18 + Vite
- React Router
- Tailwind CSS
- Axios
- Socket.IO client

Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT, Joi validation, Helmet, CORS, rate limiting

## Repository Layout

```text
project/
  src/                Frontend application (React + Vite)
  backend/            Backend API, socket handlers, models, scripts
  index.html
  package.json        Frontend scripts and dependencies
```

## Local Setup

### 1. Prerequisites

- Node.js 18+
- npm 9+
- MongoDB local instance or MongoDB Atlas

### 2. Install dependencies

From project root:

```bash
npm install
cd backend
npm install
```

### 3. Configure backend environment

Create a file at backend/.env with values similar to:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/sentry
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
```

### 4. Run the app

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

Terminal 2 (frontend, from root):

```bash
npm run dev
```

Frontend: http://localhost:5173

Backend health check: http://localhost:3001/api/health

## Core API Areas

- /api/auth
- /api/devices
- /api/wifi
- /api/security
- /api/environmental
- /api/reports
- /api/raspberrypi
- /api/sensors

ESP32-specific public endpoints include:

- POST /api/devices/data
- GET /api/devices/:espId/relay

## Real-Time Events

Socket events used by the frontend include:

- device-update
- device-updated
- device-toggled
- sensor-reading
- device-status
- safety-alert
- esp32-discovered
- wifi-connected

## Available Scripts

Frontend (root)

- npm run dev
- npm run build
- npm run preview
- npm run lint

Backend (backend)

- npm run dev
- npm start
- npm test

## Notes

- The frontend API base URL is currently configured to use http://localhost:3001/api.
- If deploying frontend and backend separately, update frontend service configuration and backend CORS settings accordingly.

## License

MIT