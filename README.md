# Task Schedule Manager

Production-grade full-stack Task Management application.

- Frontend: React + Vite + TailwindCSS, Axios, Socket.IO client, Chart.js
- Backend: Node.js + Express, Socket.IO, JWT, bcrypt, dotenv, pg (Postgres)
- Deployment: Render monorepo (server web service + client static site)

## Monorepo Structure

- `client/` React SPA
- `server/` Express API + Socket.IO

## Quick start

1) Install dependencies (from project root run both installs):

```powershell
# Backend
cd server; npm install; cd ..
# Frontend
cd client; npm install; cd ..
```

2) Configure environment variables:
- Copy `server/.env.example` to `server/.env` and set values.
- Optionally, copy `client/.env.example` to `client/.env` to override API base URL.

3) Create database schema (run on your Postgres instance):
- Execute `server/schema.sql`.

4) Run locally:
```powershell
# Terminal 1: API
cd server; npm run dev
# Terminal 2: Client
cd client; npm run dev
```
- Client dev server: http://localhost:5173
- API server: http://localhost:5000

## Authentication
- HTTP-only cookies carry access and refresh tokens.
- Endpoints:
  - POST `/api/auth/register`
  - POST `/api/auth/login`
  - GET  `/api/auth/me`
  - POST `/api/auth/refresh`
  - POST `/api/auth/logout`

## Deployment (Render)
See `render.yaml` for monorepo configuration (one Web Service for `server/`, one Static Site for `client/`).

## Scripts
- `server`: `npm run dev` starts nodemon; `npm start` runs production
- `client`: `npm run dev`, `npm run build`, `npm run preview`

## Notes
- Tasks CRUD and real-time events: to be implemented after auth.
- Use `server/schema.sql` to create tables (users, sessions, tasks).