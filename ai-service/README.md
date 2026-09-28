# TalentPilot AI Service

Este servicio es la capa de inteligencia artificial del proyecto TalentPilot AI.

En este Sprint 1 solo se implementa la base mínima del servicio para aprender FastAPI y comprobar que la aplicación funciona correctamente.

## Qué incluye esta base mínima

- aplicación FastAPI
- endpoint GET /health
- pruebas automatizadas simples
- documentación básica de arranque

## Requisitos

- Python 3.11+
- pip
- PowerShell

## 1) Crear entorno virtual

Desde la carpeta del proyecto:

```powershell
cd .\ai-service
python -m venv .venv
```

Activar el entorno virtual:

```powershell
.\.venv\Scripts\Activate.ps1
```

## 2) Instalar dependencias

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 3) Arrancar FastAPI

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 4) Ejecutar tests

```powershell
pytest -q
```

## 5) Acceder a Swagger

Cuando el servidor esté en ejecución, abre esta URL en el navegador:

```text
http://localhost:8000/docs
```

También puedes consultar la documentación OpenAPI en:

```text
http://localhost:8000/openapi.json
```

## Endpoint de salud

```text
GET /health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "talentpilot-ai-service"
}
```
