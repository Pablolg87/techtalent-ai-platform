from pydantic import BaseModel, Field, field_validator


class JobAnalysisRequest(BaseModel):
    title: str = Field(..., min_length=2)
    description: str = Field(..., min_length=20)

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("Title cannot be empty.")
        return cleaned

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("Description cannot be empty.")
        return cleaned


class JobAnalysisResponse(BaseModel):
    normalized_title: str
    skills: list[str]
    seniority: str | None = None
    keywords: list[str]
