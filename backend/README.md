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

The backend reads `DATABASE_URL`, `AI_SERVICE_URL`, and `JWT_SECRET` from the
root `.env` file. `AI_SERVICE_URL` defaults to `http://localhost:8000` when
unset. Generate a unique local JWT secret and add it to `.env` before starting
the backend:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Copy the generated value into the empty `JWT_SECRET=` entry in `.env`. The
backend requires at least 32 characters and exits at startup if the value is
missing or too short. Use a separate, securely managed secret in each deployed
environment. Never commit `.env` or reuse the example database password or a
local JWT secret in production.

Existing databases must receive the additive password-hash migration before
the authentication endpoints can be used. From the repository root, with
`DATABASE_URL` set in `.env`, apply or reapply the idempotent migration:

```powershell
Get-Content -Raw .\database\migrations\001_add_users_password_hash.sql |
  docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -f -'
```

The migration adds a nullable column and preserves existing user records.
Existing users without a password hash cannot log in until a future account
provisioning/password setup flow is implemented.

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

All endpoints accept and return JSON. `GET /health`, `POST /auth/register`, and
`POST /auth/login` are public. Every Jobs, Candidates, and Matching endpoint
requires `Authorization: Bearer <access_token>`.

### Authentication API

`POST /auth/register` accepts `email`, `full_name`, and a password of 12–128
characters. Email is trimmed and lowercased. Registration always assigns the
`recruiter` role; client-supplied role fields are ignored. Success returns
`201 Created` with a safe `{ "user": { "id", "email", "full_name", "role",
"created_at", "updated_at" } }` object. Invalid data returns `400`; an existing
email returns `409`.

`POST /auth/login` accepts `email` and `password`. Success returns `200` with
`access_token`, `token_type: "Bearer"`, `expires_in: 900`, and a safe `user`
object. Unknown emails and wrong passwords return the same `401` response:
`{ "error": "Invalid email or password." }`.

`GET /auth/me` requires `Authorization: Bearer <token>` and returns the safe
user object in `{ "user": ... }`. Missing, invalid, or expired tokens return
`401 Unauthorized`.

Passwords are stored as Argon2id hashes. Access tokens are signed using HS256,
contain only the user ID as their subject, and expire after 15 minutes. There
are no refresh tokens or password-reset flows in this block.

| Method | Endpoint | Success |
| --- | --- | --- |
| `POST` | `/jobs` | `201 Created` with the created job |
| `GET` | `/jobs` | `200 OK` with an array of jobs |
| `GET` | `/jobs/:id` | `200 OK` with the job |
| `POST` | `/candidates` | `201 Created` with the created candidate |
| `GET` | `/candidates` | `200 OK` with an array of candidates |
| `GET` | `/candidates/:id` | `200 OK` with the candidate |
| `POST` | `/matching` | `200 OK` with the AI-generated match result |

Supply the access token returned by login in the `Authorization` header for
every endpoint in this table. The signed-in user is the only source of the
job's `created_by` value; any `created_by` property sent by a client is ignored.

Example job request:

```json
{
  "title": "Backend Engineer",
  "description": "Build and maintain reliable backend services.",
  "location": "Remote"
}
```

`location` may be omitted or `null`. The server records the authenticated
user's UUID in `created_by`.

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

From the repository root, ensure `.env` exists with a generated `JWT_SECRET`,
then start PostgreSQL and the backend:

```powershell
docker compose up -d postgres
npm run dev:backend
```

In another PowerShell window, set credentials for an existing account in
environment variables, then verify creation and retrieval using fictional
data. The token and credentials are assigned to variables and should not be
printed or committed:

```powershell
$loginBody = @{
  email = $env:TALENTPILOT_TEST_EMAIL
  password = $env:TALENTPILOT_TEST_PASSWORD
} | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri http://localhost:4000/auth/login `
  -ContentType 'application/json' -Body $loginBody
$headers = @{ Authorization = "Bearer $($login.access_token)" }

$job = Invoke-RestMethod -Method Post -Uri http://localhost:4000/jobs `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body '{"title":"Backend Engineer","description":"Build and maintain reliable backend services.","location":"Remote"}'
Invoke-RestMethod http://localhost:4000/jobs -Headers $headers
Invoke-RestMethod "http://localhost:4000/jobs/$($job.id)" -Headers $headers

$candidate = Invoke-RestMethod -Method Post -Uri http://localhost:4000/candidates `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body '{"full_name":"Taylor Candidate","email":"taylor@example.test","location":"Remote","years_experience":5,"skills":["TypeScript","PostgreSQL"]}'
Invoke-RestMethod http://localhost:4000/candidates -Headers $headers
Invoke-RestMethod "http://localhost:4000/candidates/$($candidate.id)" -Headers $headers
```

Check `docker compose ps` for PostgreSQL health before performing the real
database verification. The automated tests do not require Docker.