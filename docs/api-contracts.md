# Contratos de API

## Auth service

### POST /api/v1/auth/register
Request:
```json
{
  "email": "juan@example.com",
  "password": "secret123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "candidate"
}
```

Response:
```json
{
  "userId": "uuid",
  "token": "jwt-token"
}
```

### POST /api/v1/auth/login
Request:
```json
{
  "email": "juan@example.com",
  "password": "secret123"
}
```

## User service

### GET /api/v1/users/me
Returns the current authenticated user profile.

### PATCH /api/v1/users/me/profile
Request body with profile fields like bio, location, skills, experience years.

## Company & job service

### POST /api/v1/companies
Creates a company record for a recruiter.

### POST /api/v1/jobs
Create a job posting with title, description, skills, location.

### GET /api/v1/jobs
List available jobs. Optional filters: skill, location, status.

### POST /api/v1/jobs/:id/apply
Applies a candidate to a vacancy.

## Assessment service

### POST /api/v1/assessments
Create or assign a technical assessment.

### POST /api/v1/assessments/:id/submit
Submits an assessment attempt and returns score.

## Matching service

### GET /api/v1/matching/jobs/:userId
Gets candidate-job matches for a user.

### GET /api/v1/matching/candidates/:jobId
Gets ranking of candidates for a job.

## Notification service

### GET /api/v1/notifications
Get notifications for the authenticated user.

### PATCH /api/v1/notifications/:id/read
Mark notification as read.

## Convenciones
- Todas las respuestas usan JSON.
- Requieren JWT para rutas protegidas.
- Status HTTP estándar: 200, 201, 204, 400, 401, 404, 409, 500.
