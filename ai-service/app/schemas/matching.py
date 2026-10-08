from pydantic import BaseModel, Field, field_validator


class CandidateJobMatchRequest(BaseModel):
    job_title: str = Field(..., min_length=2)
    job_description: str = Field(..., min_length=20)
    candidate_skills: list[str]

    @field_validator("job_title")
    @classmethod
    def validate_job_title(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("Job title cannot be empty.")
        return cleaned

    @field_validator("job_description")
    @classmethod
    def validate_job_description(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("Job description cannot be empty.")
        return cleaned


class CandidateJobMatchResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    matched_skills: list[str]
    missing_skills: list[str]
    explanation: str
