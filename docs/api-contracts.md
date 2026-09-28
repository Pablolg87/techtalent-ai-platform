# Contratos de API del MVP

## Visión general
El backend Node.js expone una API REST para frontend y orquesta la comunicación con el AI Service.

## Endpoints previstos

### Auth
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me

### Users
- GET /api/v1/users/me
- PATCH /api/v1/users/me
- POST /api/v1/users/profile
- POST /api/v1/users/skills

### Companies
- POST /api/v1/companies
- GET /api/v1/companies
- GET /api/v1/companies/:id

### Jobs
- POST /api/v1/jobs
- GET /api/v1/jobs
- GET /api/v1/jobs/:id
- PATCH /api/v1/jobs/:id
- PATCH /api/v1/jobs/:id/status

### Applications
- POST /api/v1/jobs/:id/apply
- GET /api/v1/applications/me
- GET /api/v1/jobs/:id/applications
- PATCH /api/v1/applications/:id/status

### Matching
- POST /api/v1/matching/jobs/:jobId/analyze
- POST /api/v1/matching/jobs/:jobId/candidates
- GET /api/v1/matching/jobs/:jobId/candidates
- GET /api/v1/matching/users/:userId/jobs

### Notifications
- GET /api/v1/notifications
- PATCH /api/v1/notifications/:id/read

### Sourcing
- POST /api/v1/sourcing/candidates/import
- POST /api/v1/sourcing/candidates/bulk
- GET /api/v1/sourcing/candidates

## Convenciones
- Todas las respuestas usan JSON.
- Los endpoints protegidos requieren autenticación.
- Los códigos HTTP siguen el estándar: 200, 201, 204, 400, 401, 403, 404, 409, 500.
- Los resultados de matching deben devolver un score y una explicación legible.

## Contrato del AI Service
El AI Service expone endpoints orientados a análisis y scoring, por ejemplo:

- POST /analyze/job
- POST /normalize/profile
- POST /match/candidates
- POST /match/explain

Estas rutas no son una implementación funcional aún, sino una especificación de diseño para la capa IA.
