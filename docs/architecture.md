# Arquitectura de TalentPilot AI

## Visión general
TalentPilot AI se diseña como un proyecto en monorepo cuya base es una arquitectura simple y mantenible para MVP:

- React frontend
- Node.js backend principal modular
- FastAPI AI Service
- PostgreSQL como base de verdad
- Docker Compose para entorno local

## Capa 1: Frontend / React
El frontend es la capa de presentación y la interfaz principal del recruiter.

Responsabilidades:
- login y autenticación desde cliente
- creación de ofertas
- visualización de ofertas
- listado de candidatos sugeridos
- visualización del score explicable
- manejo del flujo visual del pipeline

## Capa 2: Backend / Node.js
El backend principal es la capa de negocio y orquestación.

Responsabilidades:
- API REST consumida por React
- autenticación y autorización
- usuarios, roles y empresas
- gestión de vacantes
- persistencia y acceso a PostgreSQL
- coordinación con el AI Service
- almacenamiento de resultados y referencias del matching

## Capa 3: AI Service / FastAPI + Python
El AI Service queda separado como servicio especializado de IA.

Responsabilidades:
- análisis de ofertas
- normalización de perfiles y textos
- extracción de skills relevantes
- cálculo de score de match
- generación de explicaciones del match
- soporte de NLP y procesamiento de texto

## Capa 4: PostgreSQL
PostgreSQL es la fuente de verdad del sistema.

Se utiliza para manejar:
- usuarios
- empresas
- ofertas
- perfiles de candidatos
- skills
- aplicaciones
- score de matching
- resultados explicables

## Interacción entre capas
1. React invoca endpoints del backend Node.js.
2. Node.js valida, persiste y orquesta la lógica de negocio.
3. Cuando se necesita análisis o matching, Node.js llama al FastAPI.
4. FastAPI devuelve un resultado estructurado con score y explicación.
5. Node.js guarda el resultado y responde a React.

## Diagrama conceptual

```text
React Frontend
      |
      v
Node.js Backend
      |
      +--> PostgreSQL
      |
      +--> FastAPI AI Service
                |
                +--> Job Analyzer
                +--> Candidate normalization
                +--> Matching engine
                +--> Explainable scoring
```

## Decisiones del MVP
- El backend es único y modular, no multi-microservicios.
- El AI Service es un servicio pequeño y enfocado en IA.
- PostgreSQL es la única capa persistente principal.
- Redis y RabbitMQ no forman parte del MVP.

## Future Improvements
Pueden añadirse más adelante si se justifica su necesidad técnica:

- Redis para cache y rate limiting
- RabbitMQ para colas asíncronas
- procesamiento de eventos distribuidos
- dashboards analíticos más complejos
