# TalentPilot Backend

The backend is the main Node.js API for the TalentPilot platform. It will own
application business logic, serve the frontend, access PostgreSQL, and
orchestrate the AI service. This Sprint 3 foundation provides only a database-
aware health endpoint; authentication and domain CRUD are out of scope.

## Architecture

- Node.js and TypeScript with Express.
- PostgreSQL access through a reusable `pg` connection pool; no ORM.
- `GET /health` checks PostgreSQL with `SELECT 1` before reporting healthy.
- HTTP tests inject the health check so unit tests do not require a database.

## Prerequisites

- Node.js 20 or later and npm.
- PostgreSQL from the repository's Docker Compose setup for integration checks.

## Install and configure

Run these commands from the repository root in PowerShell:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm install
```

The backend reads `DATABASE_URL` from the root `.env` file. The existing
`.env.example` contains the local PostgreSQL URL. Do not put real credentials
in source control.

## Run locally

Start PostgreSQL and then the backend:

```powershell
docker compose up -d postgres
npm run dev:backend
```

The API listens on `http://localhost:4000` by default, using `BACKEND_PORT` if
it is set.

## Tests and build

```powershell
npm test
npm run build --workspace backend
```

Tests use mocked database checks and do not need a running PostgreSQL server.
`npm start --workspace backend` runs the compiled service after a successful
build.

## Verify health

With the backend and PostgreSQL running, execute:

```powershell
Invoke-RestMethod http://localhost:4000/health | ConvertTo-Json
```

Successful response:

```json
{
  "status": "ok",
  "service": "talentpilot-backend",
  "database": "connected"
}
```

If PostgreSQL is unavailable, the endpoint returns HTTP 503 with
`{"status":"error","service":"talentpilot-backend","database":"unavailable"}`.
Database error details and credentials are not returned to clients.

For a real database check, confirm `docker compose ps` shows PostgreSQL as
`healthy`, start the backend, and call `/health` as above. The backend uses
`DATABASE_URL` from the root environment file and executes `SELECT 1` through
its shared connection pool.