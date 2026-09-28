# Arquitectura de TalentPilot AI

## Visión general
TalentPilot AI se diseña como un monorepo con una capa de frontend y múltiples servicios backend desacoplados.

## Capas

### 1. Frontend
- App web de candidatos y reclutadores
- Next.js + TypeScript + Tailwind
- Autenticación cliente y vistas del pipeline

### 2. API Gateway
- Punto central para enrutar peticiones
- Validación de autenticación
- Orquestación de llamadas internas

### 3. Microservicios
- auth-service: registro, login, tokens, roles
- user-service: perfiles, CV, experiencia, skills
- company-job-service: empresas, vacantes, aplicaciones
- assessment-service: pruebas, scoring, resultados
- matching-service: recomendación y match score
- notification-service: email, alertas, mensajes

### 4. Infraestructura
- PostgreSQL para transacciones y consultas relacionales
- Redis para cache y spikes de I/O
- RabbitMQ para eventos asíncronos
- Docker Compose para iniciar entorno local

## Flujo de trabajo
1. El usuario entra a la web.
2. El gateway valida el token y redirige al servicio correcto.
3. El servicio procesa la lógica de negocio.
4. Se escriben eventos o datos persistentes.
5. El servicio de notificaciones recibe eventos relevantes.

## Decisiones clave
- Base de datos relacional para manejar perfiles, matches y pipelines complejos.
- Comunicación asíncrona para procesos no críticos como notificaciones.
- Separación de dominio por servicio para facilitar escalabilidad y despliegue independiente.
