"""
Database models and utilities
"""

from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

Base = declarative_base()


class JobDescriptionDB(Base):
    """Job description database model"""
    __tablename__ = "job_descriptions"
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    company = Column(String)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    optional_skills = Column(JSON, default=list)
    experience_level = Column(String)
    years_required = Column(Integer, default=0)
    seniority_score = Column(Integer, default=50)
    salary_range = Column(String)
    location = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class CandidateProfileDB(Base):
    """Candidate profile database model"""
    __tablename__ = "candidate_profiles"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    summary = Column(Text, nullable=False)
    skills = Column(JSON, default=list)
    experience_years = Column(Integer, default=0)
    education = Column(String)
    certifications = Column(JSON, default=list)
    previous_roles = Column(JSON, default=list)
    location = Column(String)
    linkedin_url = Column(String)
    github_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class MatchResultDB(Base):
    """Cached match results"""
    __tablename__ = "match_results"
    
    id = Column(String, primary_key=True)  # job_id_candidate_id
    job_id = Column(String, nullable=False)
    candidate_id = Column(String, nullable=False)
    overall_score = Column(Float)
    keyword_score = Column(Float)
    semantic_score = Column(Float)
    skill_score = Column(Float)
    experience_score = Column(Float)
    explanation_summary = Column(Text)
    detailed_explanation = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)


class Database:
    """Database connection and operations"""
    
    def __init__(self, database_url: str = "sqlite:///./candidate_matcher.db"):
        self.engine = create_engine(database_url, connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=self.engine)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        logger.info(f"Database initialized: {database_url}")
    
    def get_session(self) -> Session:
        """Get a database session"""
        return self.SessionLocal()
    
    def add_job(self, job: dict) -> bool:
        """Add or update a job description"""
        db = self.get_session()
        try:
            job_db = JobDescriptionDB(
                id=job['id'],
                title=job.get('title', ''),
                company=job.get('company'),
                description=job.get('description', ''),
                required_skills=job.get('required_skills', []),
                optional_skills=job.get('optional_skills', []),
                experience_level=job.get('experience_level'),
                years_required=job.get('years_required', 0),
                seniority_score=job.get('seniority_score', 50),
                salary_range=job.get('salary_range'),
                location=job.get('location')
            )
            db.merge(job_db)
            db.commit()
            logger.info(f"Added job: {job['id']}")
            return True
        except Exception as e:
            logger.error(f"Error adding job: {e}")
            db.rollback()
            return False
        finally:
            db.close()
    
    def add_candidate(self, candidate: dict) -> bool:
        """Add or update a candidate profile"""
        db = self.get_session()
        try:
            candidate_db = CandidateProfileDB(
                id=candidate['id'],
                name=candidate.get('name', ''),
                email=candidate.get('email'),
                phone=candidate.get('phone'),
                summary=candidate.get('summary', ''),
                skills=candidate.get('skills', []),
                experience_years=candidate.get('experience_years', 0),
                education=candidate.get('education'),
                certifications=candidate.get('certifications', []),
                previous_roles=candidate.get('previous_roles', []),
                location=candidate.get('location'),
                linkedin_url=candidate.get('linkedin_url'),
                github_url=candidate.get('github_url')
            )
            db.merge(candidate_db)
            db.commit()
            logger.info(f"Added candidate: {candidate['id']}")
            return True
        except Exception as e:
            logger.error(f"Error adding candidate: {e}")
            db.rollback()
            return False
        finally:
            db.close()
    
    def get_job(self, job_id: str) -> Optional[dict]:
        """Get a job description by ID"""
        db = self.get_session()
        try:
            job = db.query(JobDescriptionDB).filter(JobDescriptionDB.id == job_id).first()
            if job:
                return {
                    'id': job.id,
                    'title': job.title,
                    'company': job.company,
                    'description': job.description,
                    'required_skills': job.required_skills,
                    'optional_skills': job.optional_skills,
                    'experience_level': job.experience_level,
                    'years_required': job.years_required,
                    'seniority_score': job.seniority_score,
                    'salary_range': job.salary_range,
                    'location': job.location,
                    'created_at': job.created_at
                }
            return None
        finally:
            db.close()
    
    def get_candidate(self, candidate_id: str) -> Optional[dict]:
        """Get a candidate profile by ID"""
        db = self.get_session()
        try:
            candidate = db.query(CandidateProfileDB).filter(CandidateProfileDB.id == candidate_id).first()
            if candidate:
                return {
                    'id': candidate.id,
                    'name': candidate.name,
                    'email': candidate.email,
                    'phone': candidate.phone,
                    'summary': candidate.summary,
                    'skills': candidate.skills,
                    'experience_years': candidate.experience_years,
                    'education': candidate.education,
                    'certifications': candidate.certifications,
                    'previous_roles': candidate.previous_roles,
                    'location': candidate.location,
                    'linkedin_url': candidate.linkedin_url,
                    'github_url': candidate.github_url,
                    'created_at': candidate.created_at
                }
            return None
        finally:
            db.close()
    
    def get_all_jobs(self) -> List[dict]:
        """Get all job descriptions"""
        db = self.get_session()
        try:
            jobs = db.query(JobDescriptionDB).all()
            return [
                {
                    'id': job.id,
                    'title': job.title,
                    'description': job.description,
                    'required_skills': job.required_skills,
                    'optional_skills': job.optional_skills,
                    'years_required': job.years_required,
                    'seniority_score': job.seniority_score
                } for job in jobs
            ]
        finally:
            db.close()
    
    def get_all_candidates(self) -> List[dict]:
        """Get all candidate profiles"""
        db = self.get_session()
        try:
            candidates = db.query(CandidateProfileDB).all()
            return [
                {
                    'id': candidate.id,
                    'name': candidate.name,
                    'summary': candidate.summary,
                    'skills': candidate.skills,
                    'experience_years': candidate.experience_years,
                    'education': candidate.education,
                    'previous_roles': candidate.previous_roles
                } for candidate in candidates
            ]
        finally:
            db.close()
    
    def save_match_result(self, match_result: dict) -> bool:
        """Cache a match result"""
        db = self.get_session()
        try:
            result_id = f"{match_result['job_id']}_{match_result['candidate_id']}"
            result = MatchResultDB(
                id=result_id,
                job_id=match_result['job_id'],
                candidate_id=match_result['candidate_id'],
                overall_score=match_result['overall_score'],
                keyword_score=match_result['keyword_score'],
                semantic_score=match_result['semantic_score'],
                skill_score=match_result['skill_score'],
                experience_score=match_result['experience_score'],
                explanation_summary=match_result['explanation_summary'],
                detailed_explanation=match_result['detailed_explanation']
            )
            db.merge(result)
            db.commit()
            return True
        except Exception as e:
            logger.error(f"Error saving match result: {e}")
            db.rollback()
            return False
        finally:
            db.close()
    
    def get_match_result(self, job_id: str, candidate_id: str) -> Optional[dict]:
        """Get a cached match result"""
        db = self.get_session()
        try:
            result_id = f"{job_id}_{candidate_id}"
            result = db.query(MatchResultDB).filter(MatchResultDB.id == result_id).first()
            if result:
                return {
                    'job_id': result.job_id,
                    'candidate_id': result.candidate_id,
                    'overall_score': result.overall_score,
                    'keyword_score': result.keyword_score,
                    'semantic_score': result.semantic_score,
                    'skill_score': result.skill_score,
                    'experience_score': result.experience_score,
                    'explanation_summary': result.explanation_summary,
                    'detailed_explanation': result.detailed_explanation
                }
            return None
        finally:
            db.close()
