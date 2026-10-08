from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def matching_payload(
    job_title: str = "Senior Data Engineer",
    job_description: str = (
        "We need Python, SQL, PostgreSQL, Docker and GCP experience."
    ),
    candidate_skills: list[str] | None = None,
) -> dict[str, object]:
    return {
        "job_title": job_title,
        "job_description": job_description,
        "candidate_skills": (
            candidate_skills if candidate_skills is not None else ["Python", "SQL", "Docker"]
        ),
    }


def test_matching_three_of_five_job_skills_returns_sixty_percent() -> None:
    response = client.post("/match", json=matching_payload())

    assert response.status_code == 200
    assert response.json() == {
        "score": 60,
        "matched_skills": ["Python", "SQL", "Docker"],
        "missing_skills": ["PostgreSQL", "GCP"],
        "explanation": "Candidate matches 3 of 5 identified job skills.",
    }


def test_candidate_skill_matching_is_case_insensitive() -> None:
    payload = matching_payload(candidate_skills=["pYtHoN", "sQl", "dOcKeR"])

    response = client.post("/match", json=payload)

    assert response.status_code == 200
    assert response.json()["score"] == 60
    assert response.json()["matched_skills"] == ["Python", "SQL", "Docker"]


def test_duplicate_candidate_skills_do_not_inflate_score() -> None:
    payload = matching_payload(
        job_title="Python SQL Engineer",
        job_description="We need Python and SQL experience for our engineering team.",
        candidate_skills=["Python", "python", "SQL", "sql", "Python"],
    )

    response = client.post("/match", json=payload)

    assert response.status_code == 200
    assert response.json()["score"] == 100
    assert response.json()["matched_skills"] == ["Python", "SQL"]
    assert response.json()["missing_skills"] == []
    assert response.json()["explanation"] == (
        "Candidate matches 2 of 2 identified job skills."
    )


def test_no_matching_candidate_skills_returns_zero() -> None:
    payload = matching_payload(candidate_skills=["React", "Node.js"])

    response = client.post("/match", json=payload)

    assert response.status_code == 200
    assert response.json()["score"] == 0
    assert response.json()["matched_skills"] == []
    assert response.json()["missing_skills"] == [
        "Python",
        "SQL",
        "PostgreSQL",
        "Docker",
        "GCP",
    ]


def test_no_recognized_job_skills_cannot_be_assessed() -> None:
    payload = matching_payload(
        job_title="Data Engineer",
        job_description="We need a thoughtful problem solver for our data team.",
        candidate_skills=["Python", "SQL"],
    )

    response = client.post("/match", json=payload)

    assert response.status_code == 200
    assert response.json() == {
        "score": 0,
        "matched_skills": [],
        "missing_skills": [],
        "explanation": (
            "Match cannot be assessed because no recognized job skills were identified."
        ),
    }


def test_invalid_matching_request_returns_unprocessable_entity() -> None:
    response = client.post(
        "/match",
        json={
            "job_title": "X",
            "job_description": "too short",
            "candidate_skills": "Python",
        },
    )

    assert response.status_code == 422


def test_matched_missing_skills_and_explanation_are_consistent() -> None:
    response = client.post(
        "/match",
        json=matching_payload(candidate_skills=["Docker", "Python", "Docker"]),
    )

    assert response.status_code == 200
    result = response.json()
    assert result["matched_skills"] == ["Python", "Docker"]
    assert result["missing_skills"] == ["SQL", "PostgreSQL", "GCP"]
    assert len(result["matched_skills"]) + len(result["missing_skills"]) == 5
    assert result["explanation"] == (
        f"Candidate matches {len(result['matched_skills'])} of "
        f"{len(result['matched_skills']) + len(result['missing_skills'])} "
        "identified job skills."
    )
