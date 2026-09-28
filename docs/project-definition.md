# Definición del proyecto

## 1. Nombre definitivo
TalentPilot AI

## 2. Problema de negocio
El mercado de tecnología necesita una forma más rápida, justa y escalable de conectar talento con oportunidades. Los procesos actuales suelen depender de filtrado manual, análisis subjetivo de CV y falta de validación real de habilidades. Esto aumenta el tiempo de contratación, reduce la calidad del match y hace que candidatos altamente valiosos queden fuera del proceso por motivos no técnicos.

## 3. MVP
El MVP debe resolver el núcleo del problema con un flujo claro:

- Registro y perfiles para candidatos y reclutadores
- Carga y parseo de CV
- Evaluación técnica mínima con score
- Publicación de vacantes
- Match inicial entre candidatos y vacantes
- Estado de aplicación y pipeline
- Dashboard para reclutador
- Notificaciones básicas

## 4. User journey
### Candidato
1. Registro
2. Completa perfil y CV
3. Realiza evaluación técnica
4. Recibe oportunidades sugeridas
5. Aplica a vacantes
6. Sigue el estado desde dashboard

### Reclutador
1. Registro y creación de empresa
2. Publicación de vacante
3. Revisión de listado sugerido
4. Validación de candidatos
5. Avance del pipeline y programación de entrevistas

## 5. Arquitectura propuesta
Se implementará una arquitectura modular con:

- Frontend web en Next.js
- Gateway centralizado para APIs
- Microservicios desacoplados para negocio específico
- Base de datos relacional en PostgreSQL
- Gestión de eventos para async tasks
- Contenedores con Docker para entorno local

## 6. Microservicios exactos
1. api-gateway
2. auth-service
3. user-service
4. company-job-service
5. assessment-service
6. matching-service
7. notification-service

## 7. Base de datos y modelo de datos
Entidades principales:

- Users
- Roles
- Companies
- Jobs
- Skills
- UserSkills
- UserProfiles
- Assessments
- Questions
- AssessmentAttempts
- AssessmentResults
- Applications
- Matches
- Notifications

Cada entidad tendrá sus propias relaciones y un identificador único. Los servicios de matching y evaluación consumen datos normalizados para reducir duplicidad.

## 8. Endpoints principales
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/users/me
- PATCH /api/v1/users/me/profile
- POST /api/v1/companies
- POST /api/v1/jobs
- GET /api/v1/jobs
- POST /api/v1/jobs/:id/apply
- POST /api/v1/assessments
- POST /api/v1/assessments/:id/submit
- GET /api/v1/matching/jobs/:userId
- GET /api/v1/matching/candidates/:jobId
- GET /api/v1/notifications
- PATCH /api/v1/notifications/:id/read

## 9. Estructura de carpetas
Ver detalle en la raíz del repositorio y en la documentación de arquitectura.

## 10. Repositorio GitHub
Se prepara el repositorio local con control de versiones y el primer commit. La creación del repositorio remoto se realizará con GitHub CLI en la sesión que tenga autenticación correcta.

## 11. README v0
Se crea una versión inicial con descripción del producto, alcance, stack, y documentación de arranque del proyecto.

## 12. Entorno local + VS Code
Se recomienda:

- Node.js 20 LTS
- PostgreSQL 16
- Docker Desktop
- Git y gh
- VS Code con extensiones recomendadas

## 13. Primer commit
El primer commit incluirá la base del repositorio, la estructura inicial, README y documentación de definición del producto.
