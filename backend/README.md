# Sentry Backend (Node.js + Express + MongoDB Atlas)

## Setup
1. Copy `.env.example` to `.env` and set `MONGODB_URI` to your Atlas string and `CORS_ORIGIN` to your frontend URL.
2. `npm install`
3. (Optional) Seed: `npm run seed`
4. Run: `npm run dev`

## API Endpoints (prefix `/api`)
- `POST /auth/signup` — name, email, password
- `POST /auth/login` — email, password → JWT
- `GET /devices` (auth)
- `POST /devices` (auth) — create/update device
- `POST /readings/ingest` — ESP posts readings
- `GET /readings/latest?deviceId=&limit=` (auth)
- `GET /relays` (auth)
- `POST /relays/toggle` (auth) — { deviceId, channel, state }
- `GET /reports/summary` (auth) — { deviceId?, from?, to? }

WebSocket events:
- `reading:new` — pushed when a new reading arrives
- `relay:update` — pushed when a relay state changes
