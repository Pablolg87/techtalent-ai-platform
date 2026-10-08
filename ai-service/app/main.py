from fastapi import FastAPI

from app.schemas.job import JobAnalysisRequest, JobAnalysisResponse
from app.schemas.matching import (
    CandidateJobMatchRequest,
    CandidateJobMatchResponse,
)
from app.services.job_analyzer import analyze_job
from app.services.matching import match_candidate_to_job

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


@app.post("/match", response_model=CandidateJobMatchResponse)
def match_candidate_endpoint(
    payload: CandidateJobMatchRequest,
) -> CandidateJobMatchResponse:
    return match_candidate_to_job(payload)
