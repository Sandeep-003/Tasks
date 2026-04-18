# Task Schedule Manager

Full-stack task management application with modular backend architecture, cookie-based JWT auth, and real-time task updates.

## Stack

- Frontend: React (Vite) + Tailwind CSS + Axios + Socket.IO client + Chart.js
- Backend: Node.js + Express + PostgreSQL (`pg`) + Socket.IO
- Auth: Access/refresh JWT in HTTP-only cookies with refresh token rotation

## Architecture

### Backend layering

`Controller -> Service -> Repository -> DB`

- `server/modules/auth`: auth flow (register/login/refresh/me/logout)
- `server/modules/task`: task CRUD + pagination + status filtering + stats
- `server/modules/user`: user data access
- `server/middleware`: auth guard, role guard, centralized error handling
- `server/socket`: user-room socket handler and event emitters
- `server/utils`: logger, custom errors, jwt helpers, async handler

### Frontend structure

- `client/src/context/AuthContext.jsx`: auth state and session restore
- `client/src/context/TaskContext.jsx`: task state, CRUD calls, realtime sync
- `client/src/features/tasks`: task API + task UI components
- `client/src/pages/Dashboard.jsx`: real task metrics (total/completed/pending)
- `client/src/pages/Tasks.jsx`: full task management UI

## API overview

### Auth routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Task routes (authenticated)

- `GET /api/tasks?page=1&limit=10&status=todo`
- `GET /api/tasks/stats`
- `POST /api/tasks`
- `PATCH /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`

### Health route

- `GET /api/health`

## Local development

### 1) Install dependencies

```powershell
cd server; npm install; cd ..
cd client; npm install; cd ..
```

### 2) Configure env files

- Copy `server/.env.example` -> `server/.env`
- Copy `client/.env.example` -> `client/.env` (optional in local)

### 3) Create database schema

Run `server/schema.sql` on your PostgreSQL database.

### 4) Run app

```powershell
# Terminal 1
cd server; npm run dev

# Terminal 2
cd client; npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Database notes

- Uses UUID primary keys (`gen_random_uuid()` via `pgcrypto` extension)
- Task statuses: `todo`, `in-progress`, `done`
- Indexed fields: `tasks.user_id`, `tasks.status`, `tasks(user_id, status)`

## Production deployment on AWS

Use the dedicated guide:

- `AWS_DEPLOYMENT_GUIDE.md`

Support files used by the guide:

- `server/Dockerfile`
- `deploy/aws/ecs-task-definition.template.json`

## Scripts

### Server

- `npm run dev`: run with nodemon
- `npm start`: run production server

### Client

- `npm run dev`: run Vite dev server
- `npm run build`: production build
- `npm run preview`: preview production build