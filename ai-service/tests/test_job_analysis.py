from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint_still_passes() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "talentpilot-ai-service",
    }


def test_analyze_job_success_returns_expected_fields() -> None:
    payload = {
        "title": "Senior Python Developer",
        "description": "We are looking for a senior Python developer with FastAPI, SQL, and Docker experience. Responsibilities include building APIs and working with PostgreSQL.",
    }

    response = client.post("/analyze-job", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["normalized_title"] == "Senior Python Developer"
    assert "Python" in body["skills"]
    assert "FastAPI" in body["skills"]
    assert "SQL" in body["skills"]
    assert "Docker" in body["skills"]
    assert "PostgreSQL" in body["skills"]
    assert body["seniority"] == "senior"


def test_skill_matching_is_case_insensitive() -> None:
    payload = {
        "title": "React engineer",
        "description": "We need a react developer with Node.js and git skills. Build UI with react and work closely with the backend.",
    }

    response = client.post("/analyze-job", json=payload)

    assert response.status_code == 200
    skills = response.json()["skills"]
    assert "React" in skills
    assert "Node.js" in skills
    assert "Git" in skills


def test_duplicate_skills_are_not_returned() -> None:
    payload = {
        "title": "Python Developer",
        "description": "Looking for Python, python, and Python developer with SQL, SQL and FastAPI. Experience with Python and SQL is required.",
    }

    response = client.post("/analyze-job", json=payload)

    assert response.status_code == 200
    skills = response.json()["skills"]
    assert skills.count("Python") == 1
    assert skills.count("SQL") == 1
    assert skills.count("FastAPI") == 1


def test_seniority_is_detected() -> None:
    payload = {
        "title": "Lead Full Stack Engineer",
        "description": "We are hiring a lead engineer focused on React, Node.js, and AWS.",
    }

    response = client.post("/analyze-job", json=payload)

    assert response.status_code == 200
    assert response.json()["seniority"] == "lead"


def test_invalid_description_returns_422() -> None:
    payload = {
        "title": "Python dev",
        "description": "short",
    }

    response = client.post("/analyze-job", json=payload)

    assert response.status_code == 422
