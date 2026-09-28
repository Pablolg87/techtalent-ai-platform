# Modelo de datos PostgreSQL

## Entidades principales

### users
- id UUID PK
- email VARCHAR UNIQUE
- password_hash TEXT
- first_name VARCHAR
- last_name VARCHAR
- role_id UUID FK
- created_at TIMESTAMP
- updated_at TIMESTAMP

### roles
- id UUID PK
- name VARCHAR UNIQUE
- description TEXT

### companies
- id UUID PK
- name VARCHAR
- industry VARCHAR
- website VARCHAR
- created_by UUID FK users
- created_at TIMESTAMP

### jobs
- id UUID PK
- company_id UUID FK companies
- title VARCHAR
- description TEXT
- status VARCHAR
- location VARCHAR
- salary_min NUMERIC
- salary_max NUMERIC
- created_at TIMESTAMP

### skills
- id UUID PK
- name VARCHAR UNIQUE
- category VARCHAR

### user_skills
- id UUID PK
- user_id UUID FK users
- skill_id UUID FK skills
- proficiency_level INT
- years_exp INT

### user_profiles
- id UUID PK
- user_id UUID FK users
- bio TEXT
- experience_years INT
- current_title VARCHAR
- cv_url TEXT
- location VARCHAR

### assessments
- id UUID PK
- title VARCHAR
- type VARCHAR
- duration_minutes INT
- created_by UUID FK users
- created_at TIMESTAMP

### assessment_questions
- id UUID PK
- assessment_id UUID FK assessments
- question_text TEXT
- question_type VARCHAR
- points INT

### assessment_attempts
- id UUID PK
- user_id UUID FK users
- assessment_id UUID FK assessments
- started_at TIMESTAMP
- ended_at TIMESTAMP
- score NUMERIC

### assessment_results
- id UUID PK
- attempt_id UUID FK assessment_attempts
- question_id UUID FK assessment_questions
- answer TEXT
- is_correct BOOLEAN

### applications
- id UUID PK
- user_id UUID FK users
- job_id UUID FK jobs
- status VARCHAR
- applied_at TIMESTAMP
- recruiter_notes TEXT

### matches
- id UUID PK
- user_id UUID FK users
- job_id UUID FK jobs
- match_score NUMERIC
- reason TEXT
- created_at TIMESTAMP

### notifications
- id UUID PK
- user_id UUID FK users
- type VARCHAR
- title VARCHAR
- body TEXT
- is_read BOOLEAN
- created_at TIMESTAMP

## Relaciones principales
- users -> roles
- companies -> users
- jobs -> companies
- user_skills -> users + skills
- user_profiles -> users
- assessment_attempts -> users + assessments
- applications -> users + jobs
- matches -> users + jobs
- notifications -> users

## Consideraciones
- Se recomienda UUID como clave primaria por consistencia entre servicios.
- Se usa estado de aplicación para el pipeline del reclutador.
- Los scores y matches se almacenan para análisis y trazabilidad.
