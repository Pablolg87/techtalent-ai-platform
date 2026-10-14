# TalentPilot AI: Technical Walkthrough

## 60–90 second explanation

TalentPilot is a recruiting workspace for managing job openings and candidate profiles, then comparing a candidate’s recorded skills with the skills found in a job description. This project implements a complete HR Tech workflow across a React interface, an authenticated Express API, PostgreSQL persistence, and a Python service. The matching is deliberately straightforward: FastAPI searches job text for a fixed list of skill names and aliases, then reports which recognized skills are present in the candidate profile. The score is a percentage, not a prediction of hiring success. The result includes matched and missing skills so a recruiter can see how it was calculated. The service is called an AI service in the project, but this implementation does not use an LLM, embeddings, or a trained machine-learning model. It is deterministic rule-based matching, with clear limitations around vocabulary and context.

## Request flow

1. React calls the API client in `frontend/src/api/client.ts`. It sends JSON to `/api/...`; after sign-in, the client adds the access token as a Bearer header. The token is held in memory and is cleared on sign-out or an unauthorized response.
2. In Compose, Nginx serves the built frontend and proxies `/api/` to the Express backend, removing the `/api` prefix. In local development, Vite uses a proxy with the same prefix rewrite.
3. Express routes validate request bodies and IDs with Zod. Protected routes use `requireAuth`. Services perform parameterized SQL queries through the PostgreSQL pool for jobs and candidate data.
4. For `POST /matching`, Express checks that the job and candidate exist, then posts the job title, description, and candidate skills to FastAPI’s `/match` endpoint. FastAPI validates the payload, extracts recognized job skills, and calculates the result.
5. Express validates the response shape, adds the job and candidate IDs, and returns it to React for display. Matching failures are surfaced as service-unavailable, timeout, not-found, or invalid-response errors rather than as a successful score.

The backend calls FastAPI over the Docker network using `AI_SERVICE_URL`; the browser does not call FastAPI directly. The `/analyze-job` endpoint is separately available, while `/match` invokes the same job-analysis logic internally.

## Why a separate Python service?

In the current design, Express owns authentication, persistence, and request orchestration, while the job-analysis and matching code lives in a small FastAPI service. This keeps those responsibilities behind an HTTP contract and lets each service use its existing language ecosystem. Compose builds and health-checks the Python service separately, and the backend can validate its response and apply a ten-second timeout.

That boundary also has a cost: another container, an internal network request, and another failure mode. The algorithm is deterministic and small; it does not inherently require a microservice. Keeping it separate is a trade-off in this implementation, not evidence of an ML platform or a claim that the current workload needs independent scaling.

## Authentication and data

### Registration and login

- `POST /auth/register` validates a trimmed email, a non-empty name, and a password of 12–128 characters. It lowercases the email, hashes the password with the Argon2id variant of `argon2`, and inserts the account with the fixed `recruiter` role. A duplicate email returns `409`. The response contains a safe user profile, not a password hash or token; the user then signs in.
- `POST /auth/login` looks up the lowercased email and verifies the submitted password against the stored Argon2id hash. An unknown email and a wrong password receive the same `401` message. A successful login returns a Bearer JWT.
- The JWT is signed with HS256, expires after 15 minutes, and includes the user ID as `sub`, plus the configured issuer and audience. Verification restricts the algorithm and checks issuer, audience, expiration, and UUID subject. `JWT_SECRET` must be configured with at least 32 characters.
- Protected routes require an `Authorization: Bearer ...` header. The middleware verifies the token and attaches its user ID to the request. React keeps the token in memory, so reloading the page requires signing in again.

### Jobs and candidates

The Express API validates creation input with Zod and sends values to PostgreSQL through parameterized queries. A job needs a trimmed non-empty title and a description of at least 20 characters; location is optional and nullable. A candidate needs a trimmed name, valid email, skills represented as non-empty trimmed strings, and optional nullable location and non-negative experience. The schema trims and de-duplicates identical skill strings. PostgreSQL stores candidate skills as a JSONB array, enforces unique candidate email, and links each job to its creator. The API currently creates, lists, and fetches jobs and candidates; it has no update or delete route.

## Matching calculation

The analyzer searches the combined job title and description for a fixed set of aliases, returning each canonical skill once. For example, `postgres` and `postgresql` both map to `PostgreSQL`. Candidate skills are compared case-insensitively against those canonical job skills. For a job with recognized skills:

`score = round(100 × matched skill count / recognized job skill count)`

The implementation rounds by adding `0.5` and converting to an integer. `matched_skills` and `missing_skills` partition the recognized job skills, and the explanation states the matched count and total. If the analyzer recognizes no skills, it returns score `0`, empty skill lists, and an explanation that the match cannot be assessed.

### Example: Senior Data Platform Engineer and Sam Rivera

This is an illustrative example, not a seeded record. Suppose the job description says: “Build data pipelines with Python, SQL, PostgreSQL, Docker, and AWS.” The analyzer recognizes five job skills. Sam Rivera’s candidate profile lists Python, SQL, PostgreSQL, and AWS:

- Matched: Python, SQL, PostgreSQL, AWS
- Missing: Docker
- Score: `4 / 5 × 100 = 80%`
- Explanation: “Candidate matches 4 of 5 identified job skills.”

The “Senior” title does not affect the matching score. Although the job analyzer can detect seniority for its analysis response, `/match` calculates the score only from recognized skills. The result is a review aid, not a hiring recommendation.

The matching endpoint returns a result on request; it does not save that result. The database has an `applications.matching_score` column, but this endpoint does not write to the applications table.

## Docker Compose

`docker-compose.yml` defines five services:

| Service | Purpose |
| --- | --- |
| `frontend` | Builds the React app, serves static files with Nginx, and proxies `/api/` to the backend. |
| `backend` | Runs the production Express API; connects to PostgreSQL and FastAPI using Compose service names. |
| `ai-service` | Runs FastAPI on port 8000 for job analysis, matching, and its health endpoint. |
| `postgres` | Runs PostgreSQL 16, persists data in the `postgres_data` named volume, and initializes the schema from `database/init.sql` on database initialization. |
| `adminer` | Provides a browser-based database administration UI on port 8080. |

The backend waits for PostgreSQL health and FastAPI startup; the frontend waits for healthy backend and FastAPI services. Host ports are configurable for local use. The Compose setup and exposed ports are for development, not a production deployment configuration.

## Tests and build commands

The backend Vitest/Supertest suite exercises routes, validation, authentication, and matching-service behavior. Database access and FastAPI calls are mocked in backend tests, so they do not prove end-to-end behavior against a live database or container network. The Python pytest suite uses FastAPI’s `TestClient` to test endpoints, alias extraction, case-insensitive matching, duplicate skills, scoring, and invalid inputs. The frontend has a production TypeScript/Vite build but no frontend test command is currently defined.

Run from the repository root in PowerShell:

```powershell
npm test
cd .\ai-service
pytest -q
cd ..
npm run build --workspace frontend
npm run build --workspace backend
```

## Interview questions

**1. Why split the matching code into a Python service?**  
The current boundary isolates job analysis from the Express API’s auth and data responsibilities and gives the backend a small, validated HTTP contract. The trade-off is another network hop and deployable service; the deterministic algorithm itself does not require a microservice.

**2. How can a recruiter understand an 80% score?**  
The score is the rounded fraction of recognized job skills present in the candidate’s skills. The response also lists the matched and missing skills and explains the count. It is not a probability of hiring success.

**3. What protects a job or candidate route?**  
The route requires a Bearer token. Middleware verifies the HS256 signature, allowed algorithm, issuer, audience, expiry, and UUID subject before attaching the user ID. The current middleware authenticates users; it does not implement fine-grained role or record ownership authorization.

**4. What happens if the matching service is down or slow?**  
The backend aborts a request after ten seconds and maps timeouts, unavailable service, missing records, or malformed responses to explicit HTTP errors. It does not manufacture a fallback match.

**5. What would you change before using the score in hiring decisions?**  
I would not use the current score as a decision rule. The skill vocabulary and substring matching need careful evaluation and improvement, while proficiency, recency, equivalencies, and job-specific importance are not considered. Recruiter review remains necessary.

## Limitations and possible improvements

1. **The skill analyzer is narrow.** It uses a fixed alias list and substring checks; it cannot judge proficiency, recency, equivalent skills, or context. Improve it with a reviewed vocabulary, robust token boundaries, and measured evaluation against representative job descriptions before considering configurable weights.
2. **Authorization and account lifecycle are basic.** Registration assigns every user the recruiter role, and the API does not enforce fine-grained role or record ownership policies. Tokens are memory-only; password reset, refresh, and account recovery are not implemented. Add explicit authorization rules and a tested account-recovery/session design before production use.
3. **Persistence and automated verification are incomplete.** Matching results are not stored, and the tests mock database and service boundaries rather than exercising the full Compose stack; there is no frontend test suite. Add integration tests with disposable PostgreSQL and FastAPI services, browser-level workflow tests, and an explicit decision about whether match history should be persisted.
