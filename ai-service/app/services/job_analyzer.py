import re

from app.schemas.job import JobAnalysisRequest, JobAnalysisResponse

SKILL_ALIASES = {
    "python": "Python",
    "sql": "SQL",
    "fastapi": "FastAPI",
    "react": "React",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "docker": "Docker",
    "aws": "AWS",
    "azure": "Azure",
    "gcp": "GCP",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "git": "Git",
}

KEYWORD_ALIASES = {
    "backend": "backend",
    "api": "api",
    "database": "database",
    "cloud": "cloud",
    "software": "software",
    **SKILL_ALIASES,
}


def _normalize_title(title: str) -> str:
    return " ".join(title.split())


def _extract_skills(text: str) -> list[str]:
    normalized_text = text.lower()
    found_skills: list[str] = []
    for alias, canonical in SKILL_ALIASES.items():
        if alias in normalized_text and canonical not in found_skills:
            found_skills.append(canonical)
    return found_skills


def _extract_keywords(text: str) -> list[str]:
    normalized_text = text.lower()
    keywords: list[str] = []
    for alias, canonical in KEYWORD_ALIASES.items():
        if alias in normalized_text and canonical not in keywords:
            keywords.append(canonical)
    return keywords[:10]


def _detect_seniority(title: str, description: str) -> str | None:
    combined = f"{title} {description}".lower()

    if "lead" in combined:
        return "lead"
    if "senior" in combined or "principal" in combined or "staff" in combined:
        return "senior"
    if "mid-level" in combined or "mid level" in combined or "intermediate" in combined:
        return "mid"
    if "junior" in combined:
        return "junior"
    return None


def analyze_job(job: JobAnalysisRequest) -> JobAnalysisResponse:
    normalized_title = _normalize_title(job.title)
    combined_text = f"{normalized_title} {job.description}"

    skills = _extract_skills(combined_text)
    keywords = _extract_keywords(combined_text)
    seniority = _detect_seniority(normalized_title, job.description)

    return JobAnalysisResponse(
        normalized_title=normalized_title,
        skills=skills,
        seniority=seniority,
        keywords=keywords,
    )
