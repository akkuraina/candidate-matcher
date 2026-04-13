"""
Data models for job descriptions and candidates
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class SkillModel(BaseModel):
    """Individual skill item"""
    name: str
    proficiency: Optional[str] = Field(None, description="beginner, intermediate, expert")
    years: Optional[int] = Field(None, description="Years of experience with this skill")


class JobDescription(BaseModel):
    """Job Description model"""
    id: Optional[str] = None
    title: str
    company: Optional[str] = None
    description: str
    required_skills: List[str] = []
    optional_skills: List[str] = []
    experience_level: Optional[str] = Field(None, description="junior, mid, senior")
    years_required: int = 0
    seniority_score: int = Field(50, ge=0, le=100)
    salary_range: Optional[str] = None
    location: Optional[str] = None
    created_at: Optional[datetime] = None
    
    def to_dict(self):
        """Convert to dictionary for matching engine"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'required_skills': self.required_skills,
            'optional_skills': self.optional_skills,
            'experience_level': self.experience_level,
            'years_required': self.years_required,
            'seniority_score': self.seniority_score
        }


class CandidateProfile(BaseModel):
    """Candidate Profile model"""
    id: Optional[str] = None
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    summary: str
    skills: List[str] = []
    experience_years: int = 0
    education: Optional[str] = None
    certifications: List[str] = []
    previous_roles: List[str] = []
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    created_at: Optional[datetime] = None
    
    def to_dict(self):
        """Convert to dictionary for matching engine"""
        return {
            'id': self.id,
            'name': self.name,
            'summary': self.summary,
            'skills': self.skills,
            'experience_years': self.experience_years,
            'education': self.education,
            'previous_roles': self.previous_roles
        }


class MatchResult(BaseModel):
    """Single match result"""
    candidate_id: str
    candidate_name: Optional[str] = None
    rank: int
    overall_score: float
    keyword_score: float
    semantic_score: float
    skill_score: float
    experience_score: float
    explanation_summary: str
    detailed_explanation: dict


class JobMatchResults(BaseModel):
    """Matching results for a job description"""
    job_id: str
    job_title: Optional[str] = None
    total_candidates: int
    timestamp: datetime
    results: List[MatchResult]


class DetailedMatchExplanation(BaseModel):
    """Detailed explanation for a single match"""
    job_id: str
    job_title: Optional[str] = None
    candidate_id: str
    candidate_name: Optional[str] = None
    overall_score: float
    skill_match: dict
    experience: dict
    technology_match: dict
    semantic_alignment: dict
    summary: str


class BatchUploadRequest(BaseModel):
    """Request for batch upload of jobs or candidates"""
    items: List[dict]
    type: str = Field(..., description="'job' or 'candidate'")


class MatchRequest(BaseModel):
    """Request to match candidates against a job"""
    job_id: str
    limit: Optional[int] = Field(None, description="Limit number of results")
    min_score: Optional[float] = Field(None, description="Minimum score threshold")
