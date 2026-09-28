from fastapi import FastAPI

from app.schemas.job import JobAnalysisRequest, JobAnalysisResponse
from app.services.job_analyzer import analyze_job

app = FastAPI(title="TalentPilot AI Service")


@app.get("/health")
def health_check() -> dict:
    return {
        "status": "ok",
        "service": "talentpilot-ai-service",
    }


@app.post("/analyze-job", response_model=JobAnalysisResponse)
def analyze_job_endpoint(payload: JobAnalysisRequest) -> JobAnalysisResponse:
    return analyze_job(payload)
