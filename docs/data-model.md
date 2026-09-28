# Modelo de datos PostgreSQL

## Visión general
El modelo de datos del MVP se mantiene simple y centrado en la relación entre ofertas, perfiles y resultados de matching.

## Entidades principales

### roles
- id
- name
- description

### users
- id
- email
- password_hash
- role_id
- created_at
- updated_at

### companies
- id
- name
- industry
- created_by_user_id
- created_at

### jobs
- id
- company_id
- title
- description
- location
- seniority
- status
- created_by_user_id
- created_at

### skills
- id
- name
- category

### user_profiles
- id
- user_id
- full_name
- headline
- bio
- experience_years
- location
- cv_text
- cv_url
- source_type
- created_at

### user_skills
- id
- user_id
- skill_id
- level
- years_experience

### job_requirements
- id
- job_id
- skill_id
- required_level
- is_mandatory

### applications
- id
- user_id
- job_id
- status
- applied_at
- recruiter_notes

### matches
- id
- user_id
- job_id
- score
- generated_at

### match_explanations
- id
- match_id
- reason_type
- explanation_text

### notifications
- id
- user_id
- type
- message
- is_read
- created_at

## Relaciones principales
- users -> roles
- companies -> users
- jobs -> companies
- user_profiles -> users
- user_skills -> users + skills
- job_requirements -> jobs + skills
- applications -> users + jobs
- matches -> users + jobs
- match_explanations -> matches
- notifications -> users

## Consideraciones del MVP
- Se prioriza claridad sobre complejidad.
- Cada entidad tiene un identificador único y relaciones simples.
- El almacenamiento del score explicable se hace de manera trazable.
- Redis y RabbitMQ no forman parte del esquema actual del MVP.

## Fuentes permitidas para candidatos
El modelo admite perfiles importados desde:

- datasets públicos
- entrada manual
- CVs cargados por el usuario
- datos sintéticos
- fuentes legales y autorizadas

No incluye scraping ni extracción no autorizada.
