# TalentPilot AI

TalentPilot AI es una plataforma de reclutamiento tech enfocada en reducir la fricción entre empresas y candidatos mediante análisis estructurado de ofertas y perfiles, matching explicable y una visión clara del pipeline de contratación.

## 1. Nombre definitivo del proyecto

TalentPilot AI

## 2. Problema de negocio

Las empresas tecnológicas necesitan identificar talento con rapidez, sin depender solo del filtrado manual de CVs. El problema principal es la baja objetividad en el proceso de revisión y la dificultad para comparar perfiles con requisitos reales de la vacante. El MVP busca reducir ese ruido y apoyar la decisión de reclutamiento con un matching más transparente y estructurado.

## 3. Arquitectura aprobada del MVP

La arquitectura definitiva del MVP queda definida como:

- React frontend
- Node.js backend principal modular
- FastAPI como servicio especializado de IA
- PostgreSQL como fuente de verdad
- Docker / Docker Compose para entorno local
- Sin Redis en el MVP
- Sin RabbitMQ en el MVP

## 4. Responsabilidad por capa

### Frontend / React
- Interfaz del recruiter
- Creación y visualización de ofertas
- Visualización de candidatos
- Resultados de matching
- Autenticación desde la perspectiva del cliente

### Backend / Node.js
- API principal consumida por React
- Autenticación
- Usuarios
- Vacantes
- Candidatos
- Persistencia y acceso a PostgreSQL
- Orquestación de llamadas al AI Service

### AI Service / FastAPI + Python
- Análisis de ofertas
- Normalización de información relevante
- Extracción de skills
- Candidate matching
- Matching score
- Explicaciones del matching
- Funcionalidades NLP/IA

### PostgreSQL
- Fuente de verdad del sistema

## 5. MVP objetivo

El MVP permite:

- registrar usuarios y roles
- crear y listar ofertas de empleo
- almacenar perfiles y skills relevantes
- ingestar datos permitidos de candidatos
- analizar ofertas y candidatos con lógica de IA
- calcular un score de compatibilidad
- mostrar resultados ordenados en la interfaz
- facilitar la toma de decisión del recruiter

## 6. Estrategia de sourcing para el MVP

La fuente de candidatos debe cumplir normas legales y éticas:

- datasets públicos
- datos sintéticos
- carga controlada de CVs o perfiles
- fuentes legalmente accesibles

No se contempla scraping de LinkedIn ni fuentes no autorizadas.

## 7. Stack principal

- React
- TypeScript
- Node.js
- TypeScript
- FastAPI
- Python
- PostgreSQL
- Docker
- Docker Compose

## 8. Estructura del repositorio

```text
.
├── frontend/
├── backend/
├── ai-service/
├── database/
├── docs/
├── tests/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── README.md
└── LICENSE
```

## 9. Documentación técnica

- [docs/project-definition.md](docs/project-definition.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/data-model.md](docs/data-model.md)
- [docs/api-contracts.md](docs/api-contracts.md)

## 10. Future Improvements

Quedan fuera del MVP y pueden considerarse más adelante:

- Redis para cache y rate limiting
- RabbitMQ para procesos asíncronos
- paneles analíticos avanzados
- integrations con ATS externos
- email automation
- feature engineering con modelos más complejos
- LLM externo para resumen y redacción asistida

## 11. Estado del proyecto

La base del repositorio queda preparada para continuar con el desarrollo real del MVP sin introducir componentes innecesarios ni complejidad prematura.
