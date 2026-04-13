"""
Tests for API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Database


@pytest.fixture
def client():
    """Create a test client"""
    return TestClient(app)


def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_stats_endpoint(client):
    """Test stats endpoint"""
    response = client.get("/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_jobs" in data
    assert "total_candidates" in data
    assert "database_type" in data


def test_create_job(client):
    """Test creating a job"""
    job_data = {
        "title": "Test Engineer",
        "description": "Test job description",
        "required_skills": ["Python", "Testing"],
        "years_required": 2
    }
    response = client.post("/jobs", json=job_data)
    assert response.status_code == 200
    assert "id" in response.json()


def test_list_jobs(client):
    """Test listing jobs"""
    response = client.get("/jobs")
    assert response.status_code == 200
    data = response.json()
    assert "jobs" in data
    assert "total" in data


def test_create_candidate(client):
    """Test creating a candidate"""
    candidate_data = {
        "name": "Test Candidate",
        "summary": "Test summary",
        "skills": ["Python", "Testing"],
        "experience_years": 3
    }
    response = client.post("/candidates", json=candidate_data)
    assert response.status_code == 200
    assert "id" in response.json()


def test_list_candidates(client):
    """Test listing candidates"""
    response = client.get("/candidates")
    assert response.status_code == 200
    data = response.json()
    assert "candidates" in data
    assert "total" in data


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
