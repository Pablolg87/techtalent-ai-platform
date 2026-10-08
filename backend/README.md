# TalentPilot Backend

The backend is the Node.js API for TalentPilot. It provides database-backed
Jobs and Candidates endpoints plus a PostgreSQL-aware health check.

## Architecture

- Node.js and TypeScript with Express.
- PostgreSQL access through a reusable `pg` connection pool; no ORM.
- `GET /health` checks PostgreSQL with `SELECT 1` before reporting healthy.
- HTTP tests mock service/database access and do not require PostgreSQL.

## Prerequisites

- Node.js 20 or later and npm.
- PostgreSQL from the repository's Docker Compose setup for integration checks.

## Install and configure

Run these commands from the repository root in PowerShell:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm install
```

The backend reads `DATABASE_URL` and `AI_SERVICE_URL` from the root `.env` file.
`AI_SERVICE_URL` defaults to `http://localhost:8000` when unset. The existing
`.env.example` contains the local PostgreSQL URL and AI service URL. Do not put
real credentials in source control.

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

## Jobs and Candidates API

All endpoints accept and return JSON. There is no authentication yet.

| Method | Endpoint | Success |
| --- | --- | --- |
| `POST` | `/jobs` | `201 Created` with the created job |
| `GET` | `/jobs` | `200 OK` with an array of jobs |
| `GET` | `/jobs/:id` | `200 OK` with the job |
| `POST` | `/candidates` | `201 Created` with the created candidate |
| `GET` | `/candidates` | `200 OK` with an array of candidates |
| `GET` | `/candidates/:id` | `200 OK` with the candidate |
| `POST` | `/matching` | `200 OK` with the AI-generated match result |

Example job request:

```json
{
  "title": "Backend Engineer",
  "description": "Build and maintain reliable backend services.",
  "location": "Remote",
  "created_by": "11111111-1111-4111-8111-111111111111"
}
```

`created_by` must reference an existing user UUID. `location` may be omitted or
`null`.

Example candidate request:

```json
{
  "full_name": "Taylor Candidate",
  "email": "taylor@example.test",
  "location": "Remote",
  "years_experience": 5,
  "skills": ["TypeScript", "PostgreSQL"]
}
```

`location` and `years_experience` may be omitted or `null`. Skills are stored
as a JSONB array.

### Match a candidate to a job

`POST /matching` takes existing job and candidate UUIDs and returns a match
computed by the AI service. Matching results are not persisted.

```json
{
  "job_id": "11111111-1111-4111-8111-111111111111",
  "candidate_id": "33333333-3333-4333-8333-333333333333"
}
```

The response includes `job_id`, `candidate_id`, `score`, `matched_skills`,
`missing_skills`, and `explanation`. Invalid UUIDs return `400`; unknown jobs
or candidates return `404`. AI service unavailability or timeout returns
`503` or `504`, and invalid AI responses return `502`.

Invalid request bodies or UUIDs return `400 Bad Request`; a job referencing a
nonexistent user also returns `400`. Duplicate candidate email returns
`409 Conflict`, and a valid but unknown resource ID returns `404 Not Found`.
Unexpected server/database errors return a generic `500 Internal Server Error`
without database details.

## Local verification

From the repository root, ensure `.env` exists (copy `.env.example` if needed),
then start PostgreSQL and the backend:

```powershell
docker compose up -d postgres
npm run dev:backend
```

In another PowerShell window, verify creation and retrieval using fictional
data. Replace the sample `created_by` UUID with an existing user UUID:

```powershell
$job = Invoke-RestMethod -Method Post -Uri http://localhost:4000/jobs `
  -ContentType 'application/json' `
  -Body '{"title":"Backend Engineer","description":"Build and maintain reliable backend services.","location":"Remote","created_by":"11111111-1111-4111-8111-111111111111"}'
Invoke-RestMethod http://localhost:4000/jobs
Invoke-RestMethod "http://localhost:4000/jobs/$($job.id)"

$candidate = Invoke-RestMethod -Method Post -Uri http://localhost:4000/candidates `
  -ContentType 'application/json' `
  -Body '{"full_name":"Taylor Candidate","email":"taylor@example.test","location":"Remote","years_experience":5,"skills":["TypeScript","PostgreSQL"]}'
Invoke-RestMethod http://localhost:4000/candidates
Invoke-RestMethod "http://localhost:4000/candidates/$($candidate.id)"
```

Check `docker compose ps` for PostgreSQL health before performing the real
database verification. The automated tests do not require Docker.