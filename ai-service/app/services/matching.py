from app.schemas.job import JobAnalysisRequest
from app.schemas.matching import CandidateJobMatchRequest, CandidateJobMatchResponse
from app.services.job_analyzer import analyze_job


def match_candidate_to_job(
    request: CandidateJobMatchRequest,
) -> CandidateJobMatchResponse:
    analyzed_job = analyze_job(
        JobAnalysisRequest(
            title=request.job_title,
            description=request.job_description,
        )
    )
    job_skills = analyzed_job.skills

    if not job_skills:
        return CandidateJobMatchResponse(
            score=0,
            matched_skills=[],
            missing_skills=[],
            explanation=(
                "Match cannot be assessed because no recognized job skills "
                "were identified."
            ),
        )

    candidate_skill_names = {
        skill.strip().casefold()
        for skill in request.candidate_skills
        if skill.strip()
    }
    matched_skills = [
        skill for skill in job_skills if skill.casefold() in candidate_skill_names
    ]
    missing_skills = [
        skill for skill in job_skills if skill.casefold() not in candidate_skill_names
    ]
    score = int(len(matched_skills) / len(job_skills) * 100 + 0.5)

    return CandidateJobMatchResponse(
        score=score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        explanation=(
            f"Candidate matches {len(matched_skills)} of {len(job_skills)} "
            "identified job skills."
        ),
    )
