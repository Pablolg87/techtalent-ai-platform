# TalentPilot AI Architecture

## Overview

The project is a local-development monorepo with a React frontend, an Express API, a PostgreSQL database, and a Python FastAPI service. Docker Compose runs these services together.

## Components

### React frontend

The frontend provides sign-in and registration, job and candidate forms and lists, and the matching interface. It sends JSON requests to the Express API. In Compose, Nginx serves the built frontend and proxies `/api/` to Express; during local development, Vite provides the corresponding proxy.

### Express backend

The backend exposes the REST API, validates requests, handles registration and JWT authentication, and reads and writes user, job, and candidate data in PostgreSQL. For a match request, it loads the selected job and candidate, calls FastAPI, validates the returned result, and responds to the frontend.

### FastAPI matching service

The Python service performs deterministic, skills-based matching. It searches a job title and description for entries in a fixed skill-and-alias list, compares those recognized skills case-insensitively with the candidate's recorded skills, and returns the score, matched skills, missing skills, and explanation. It uses no trained model, embeddings, or profile normalization.

### PostgreSQL

PostgreSQL stores user accounts, jobs, candidates, and application records. Candidate skills are stored as JSONB. Although the schema includes an `applications.matching_score` column, the current matching endpoint does not create or update application records or persist its result.

## Request flow

1. React sends a request through the `/api/` proxy to Express.
2. Express validates the request and, for matching, loads the selected job and candidate from PostgreSQL.
3. Express sends the job title, description, and candidate skills to FastAPI's `POST /match` endpoint over the service network.
4. FastAPI calculates a deterministic skills-based result and returns it to Express.
5. Express validates and returns the result to React; it does not save the result.

The FastAPI service also exposes `GET /health` and `POST /analyze-job`. The matching endpoint uses the same job-analysis logic internally to identify the job's recognized skills.

## Diagram

```text
React Frontend
      |
      v
Express Backend
      |
      +--> PostgreSQL
      |
      +--> FastAPI Matching Service
                |
                +--> Fixed skill and alias analysis
                +--> Deterministic score and explanation
```

## Design trade-offs

- Express is a single modular backend; FastAPI is a separate service with an HTTP boundary. This adds a network hop and service to operate, even though the matching algorithm is small and deterministic.
- PostgreSQL is the persistent store. Redis and RabbitMQ are not part of the current setup.

## Possible future improvements

If future requirements justify them, possible extensions include caching or rate limiting, asynchronous queues, distributed event processing, and richer analytics.
