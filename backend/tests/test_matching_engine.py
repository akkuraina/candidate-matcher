"""
Unit tests for the matching engine
"""

import pytest
from app.matching_engine import MatchingEngine


@pytest.fixture
def matching_engine():
    """Create a matching engine instance for testing"""
    return MatchingEngine(use_embeddings=False)  # Disable embeddings for faster tests


@pytest.fixture
def sample_jobs():
    """Sample job descriptions for testing"""
    return [
        {
            'id': 'jd-001',
            'title': 'Senior Backend Engineer',
            'description': 'Looking for an experienced backend engineer with Python expertise',
            'required_skills': ['Python', 'FastAPI', 'Docker'],
            'optional_skills': ['Kubernetes', 'AWS'],
            'years_required': 5,
            'seniority_score': 80
        },
        {
            'id': 'jd-002',
            'title': 'Junior Frontend Developer',
            'description': 'React developer needed for UI development',
            'required_skills': ['React', 'JavaScript', 'HTML'],
            'optional_skills': ['TypeScript', 'CSS'],
            'years_required': 1,
            'seniority_score': 30
        }
    ]


@pytest.fixture
def sample_candidates():
    """Sample candidate profiles for testing"""
    return [
        {
            'id': 'cand-001',
            'name': 'Alice Johnson',
            'summary': 'Experienced backend engineer with 8 years building Python applications',
            'skills': ['Python', 'FastAPI', 'Docker', 'Kubernetes', 'PostgreSQL'],
            'experience_years': 8,
            'education': 'BS Computer Science'
        },
        {
            'id': 'cand-002',
            'name': 'Bob Smith',
            'summary': 'Recent graduate learning React',
            'skills': ['JavaScript', 'React', 'HTML', 'CSS'],
            'experience_years': 0,
            'education': 'BS Computer Science'
        },
        {
            'id': 'cand-003',
            'name': 'Carol Davis',
            'summary': 'Data scientist with Python background',
            'skills': ['Python', 'SQL', 'Pandas', 'Scikit-learn'],
            'experience_years': 4,
            'education': 'MS Data Science'
        }
    ]


def test_skill_matching(matching_engine, sample_jobs, sample_candidates):
    """Test skill matching scoring"""
    matching_engine.add_job_descriptions(sample_jobs)
    matching_engine.add_candidates(sample_candidates)
    
    # Alice should rank high for backend job
    matches = matching_engine.match_candidates('jd-001')
    assert matches[0].candidate_id == 'cand-001'
    assert matches[0].skill_score > 80


def test_experience_matching(matching_engine, sample_jobs, sample_candidates):
    """Test experience alignment scoring"""
    matching_engine.add_job_descriptions(sample_jobs)
    matching_engine.add_candidates(sample_candidates)
    
    # Alice has 8 years, senior job requires 5
    matches = matching_engine.match_candidates('jd-001')
    assert matches[0].experience_score > 80


def test_junior_candidate_penalties(matching_engine, sample_jobs, sample_candidates):
    """Test that junior candidates are penalized for senior roles"""
    matching_engine.add_job_descriptions(sample_jobs)
    matching_engine.add_candidates(sample_candidates)
    
    # Bob ranks low for senior job despite skill match
    matches = matching_engine.match_candidates('jd-001')
    bob_match = next(m for m in matches if m.candidate_id == 'cand-002')
    assert bob_match.experience_score < 30


def test_ranking_order(matching_engine, sample_jobs, sample_candidates):
    """Test that candidates are ranked by overall score"""
    matching_engine.add_job_descriptions(sample_jobs)
    matching_engine.add_candidates(sample_candidates)
    
    matches = matching_engine.match_candidates('jd-001')
    
    # Verify descending order
    for i in range(len(matches) - 1):
        assert matches[i].overall_score >= matches[i + 1].overall_score


def test_missing_skills(matching_engine):
    """Test handling of missing skills"""
    jobs = [{
        'id': 'test-job',
        'title': 'Test',
        'description': 'Test job',
        'required_skills': ['Python', 'Docker'],
        'optional_skills': [],
        'years_required': 2,
        'seniority_score': 50
    }]
    
    candidates = [{
        'id': 'test-cand',
        'name': 'Test Candidate',
        'summary': 'Has no skills',
        'skills': [],
        'experience_years': 5,
        'education': 'BS'
    }]
    
    matching_engine.add_job_descriptions(jobs)
    matching_engine.add_candidates(candidates)
    
    matches = matching_engine.match_candidates('test-job')
    assert matches[0].skill_score == 0


def test_explanation_generation(matching_engine, sample_jobs, sample_candidates):
    """Test that explanations are generated"""
    matching_engine.add_job_descriptions(sample_jobs)
    matching_engine.add_candidates(sample_candidates)
    
    matches = matching_engine.match_candidates('jd-001')
    
    # Check explanation is not empty
    assert matches[0].explanation_summary
    assert len(matches[0].explanation_summary) > 0
    
    # Check detailed explanation structure
    assert 'skill_match' in matches[0].detailed_explanation
    assert 'experience' in matches[0].detailed_explanation


def test_multiple_candidates_for_job(matching_engine, sample_jobs, sample_candidates):
    """Test matching multiple candidates against one job"""
    matching_engine.add_job_descriptions(sample_jobs)
    matching_engine.add_candidates(sample_candidates)
    
    matches = matching_engine.match_candidates('jd-001')
    
    # Should have all candidates
    assert len(matches) == len(sample_candidates)
    
    # All should have scores
    for match in matches:
        assert 0 <= match.overall_score <= 100


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
