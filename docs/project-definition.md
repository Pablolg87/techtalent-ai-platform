# Definición del proyecto

## 1. Nombre definitivo
TalentPilot AI

## 2. Problema de negocio
El mercado tecnológico necesita una forma más ágil y objetiva de conectar talento con vacantes. El proceso actual suele basarse en revisión manual de CVs, comparación subjetiva de perfiles y falta de visibilidad clara sobre la compatibilidad real entre candidato y oferta. El objetivo del MVP es reducir esa fricción y aportar un primer nivel de clasificación basada en skills, experiencia y contexto de la oferta.

## 3. Objetivo del MVP
El MVP permitirá:

- registrar usuarios y roles
- crear y consultar ofertas
- almacenar perfiles y skills
- importar candidatos desde fuentes legales y controladas
- analizar ofertas y candidatos con lógica de IA
- calcular un score de compatibilidad
- mostrar el ranking de candidatos al recruiter
- reducir el tiempo de revisión inicial del proceso de contratación

## 4. User journey
### Reclutador
1. Inicia sesión.
2. Crea una empresa o accede a una existente.
3. Publica una oferta de trabajo.
4. Solicita análisis del puesto.
5. Consulta candidatos recomendados.
6. Revisa el score explicable y los motivos del match.
7. Decide qué perfiles seguir revisando.

### Candidato
1. Registra su perfil.
2. Completa experiencia, stack y skills.
3. Sube o importa su CV.
4. Participa en el flujo de match con ofertas relevantes.
5. Recibe un estado general del proceso y una mejor visualización de oportunidades.

## 5. Arquitectura aprobada
Se implementará una arquitectura simple y manejable:

- Frontend en React
- Backend principal en Node.js
- AI Service en FastAPI + Python
- Base de datos relacional en PostgreSQL
- Entorno local con Docker Compose

## 6. Responsabilidad por capa
### Frontend / React
- UI del recruiter
- gestión de ofertas
- visualización de resultados
- autenticación desde cliente

### Backend / Node.js
- API principal
- usuarios, roles, empresas y vacantes
- persistencia y acceso a PostgreSQL
- coordinación con AI Service

### AI Service / FastAPI
- análisis de ofertas
- extracción de skills
- normalización de perfiles
- matching y scoring
- explicaciones del match

### PostgreSQL
- fuente de verdad del sistema

## 7. Fuente de datos del MVP
Para el MVP se priorizan:

- datasets públicos bajo licencias adecuadas
- datos sintéticos
- carga controlada de CVs o perfiles
- fuentes legalmente accesibles

No se contempla scraping de LinkedIn ni extracción no autorizada.

## 8. Estructura del repositorio
El repositorio se organizará con la siguiente estructura base:

- frontend/
- backend/
- ai-service/
- database/
- docs/
- tests/

## 9. Future improvements
Se pueden considerar más adelante:

- Redis para cache y rate limiting
- RabbitMQ para colas asíncronas
- métricas analíticas avanzadas
- integraciones con ATS externos
- LLM externo para resumen y redacción

## 10. Estado actual
La documentación del proyecto queda alineada con la arquitectura aprobada para el MVP y sin componentes redundantes ni innecesarios en la fase inicial.
