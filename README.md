# TalentPilot AI

TalentPilot AI es una plataforma de reclutamiento y talento tech orientada a conectar candidatos con empresas mediante evaluación objetiva de habilidades, recomendación inteligente y automatización del pipeline de contratación.

## 1. Nombre definitivo del proyecto

TalentPilot AI

## 2. Problema de negocio

Las empresas tecnológicas pierden tiempo y dinero en procesos de contratación manuales: revisión de CVs repetitiva, filtrado subjetivo, baja visibilidad de talento no tradicional y dificultad para comparar habilidades reales de candidatos. A su vez, los candidatos tienen poca claridad sobre qué oportunidades son realmente adecuadas para su perfil y no cuentan con un canal que valide sus habilidades de forma objetiva.

## 3. MVP

El MVP incluye:

- Registro e inicio de sesión para candidatos y reclutadores
- Perfiles de usuario con experiencia, stack técnico y CV
- Publicación de vacantes por parte de empresas
- Carga y parseo de CV
- Evaluación técnica básica (tests de habilidades)
- Match de candidatos a vacantes basado en skills, experiencia y nivel
- Pipeline de aplicaciones con estado: aplicada, en revisión, entrevista, oferta, rechazada
- Notificaciones por email / dashboard
- Dashboard de reclutador con shortlist y métricas básicas

## 4. User journey

### Candidato
1. Se registra y completa su perfil.
2. Sube su CV o completa su experiencia.
3. Responde una prueba técnica inicial.
4. Recibe un score de match con vacantes relevantes.
5. Aplica a posiciones y sigue su estado.
6. Recibe notificaciones de avances y feedback.

### Reclutador
1. Inicia sesión y crea una empresa.
2. Publica una vacante con requisitos técnicos.
3. Consulta candidatos sugeridos por el sistema.
4. Valida perfiles en una vista de pipeline.
5. Agenda entrevistas y avanza candidatos.

## 5. Arquitectura

Se propone una arquitectura basada en monorepo con microservicios y una base de datos relacional:

- Frontend: Next.js + TypeScript + Tailwind
- API Gateway: Node.js/NestJS o Fastify
- Microservicios: autenticación, usuarios, empresas/jobs, evaluaciones, matching, notificaciones
- Base de datos: PostgreSQL
- Mensajería: RabbitMQ o Kafka para eventos asíncronos
- Cache y sesión: Redis
- Infraestructura: Docker + Docker Compose + GitHub Actions

## 6. Microservicios exactos

1. api-gateway
2. auth-service
3. user-service
4. company-job-service
5. assessment-service
6. matching-service
7. notification-service

## 7. Modelo de datos

La capa de persistencia se centra en PostgreSQL con entidades principales:

- users
- roles
- companies
- jobs
- skills
- user_skills
- user_profiles
- assessments
- assessment_questions
- assessment_attempts
- assessment_results
- applications
- matches
- notifications

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

```text
.
├── apps/
│   ├── web/
│   └── admin/
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── company-job-service/
│   ├── assessment-service/
│   ├── matching-service/
│   └── notification-service/
├── db/
│   ├── migrations/
│   └── seeds/
├── docs/
│   ├── project-definition.md
│   ├── architecture.md
│   ├── data-model.md
│   └── api-contracts.md
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── .gitignore
├── README.md
└── package.json
```

## 10. Repositorio GitHub

Se creará el repositorio remoto con GitHub usando la CLI cuando la autenticación esté disponible. La estructura local queda preparada para el primer commit.

## 11. README v0

Este archivo cumple la versión inicial de documentación del proyecto.

## 12. Entorno local + VS Code

Previsión de entorno:

- VS Code con extensiones: ESLint, Prettier, Docker, GitHub Copilot, Prisma, PostgreSQL, REST Client
- Docker Desktop
- Node.js 20 LTS
- PostgreSQL 16
- Git
- gh (GitHub CLI)

## 13. Primer commit

El primer commit se realizará con la base del proyecto, documentación, estructura inicial y configuración básica.

## Documentación adicional

- [docs/project-definition.md](docs/project-definition.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/data-model.md](docs/data-model.md)
- [docs/api-contracts.md](docs/api-contracts.md)

## Stack recomendado

- Frontend: Next.js 14+
- Backend: NestJS + TypeScript
- Database: PostgreSQL 16
- Messaging: RabbitMQ
- Cache: Redis
- Containerization: Docker Compose

## Estado actual

Base del proyecto definida, documentación inicial creada y estructura lista para continuar con implementación y control de versiones.
