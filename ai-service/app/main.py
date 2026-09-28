from fastapi import FastAPI

app = FastAPI(title="TalentPilot AI Service")


@app.get("/health")
def health_check() -> dict:
    return {
        "status": "ok",
        "service": "talentpilot-ai-service",
    }
