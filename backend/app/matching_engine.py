"""
Hybrid Candidate Matching Engine

Combines multiple matching approaches:
1. TF-IDF for keyword overlap
2. Semantic similarity using sentence transformers
3. Skill-based weighted scoring
4. Experience alignment
"""

import numpy as np
from typing import List, Dict, Tuple, Optional, Any
from dataclasses import dataclass
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)


@dataclass
class MatchScore:
    """Detailed scoring breakdown for a candidate-job match"""
    candidate_id: str
    job_id: str
    overall_score: float
    keyword_score: float
    semantic_score: float
    skill_score: float
    experience_score: float
    explanation_summary: str
    detailed_explanation: Dict[str, Any]


class MatchingEngine:
    """
    Hybrid matching engine for ranking candidates against job descriptions.
    
    Approach:
    - Keyword matching (TF-IDF): Identifies skill/technology overlap
    - Semantic similarity: Understands context and domain knowledge
    - Skill scoring: Weights required vs optional skills
    - Experience alignment: Considers years of experience and seniority
    
    All components are weighted to produce a final 0-100 score.
    """
    
    def __init__(self, use_embeddings: bool = True, embedding_model: str = "all-MiniLM-L6-v2"):
        """
        Initialize the matching engine.
        
        Args:
            use_embeddings: Whether to use semantic embeddings (requires sentence-transformers)
            embedding_model: Model name for embeddings
        """
        self.use_embeddings = use_embeddings
        self.embedding_model = None
        self.tfidf_vectorizer = None
        self.tfidf_matrix = None
        self.candidates = {}
        self.jobs = {}
        
        if use_embeddings:
            try:
                self.embedding_model = SentenceTransformer(embedding_model)
                logger.info(f"Loaded embedding model: {embedding_model}")
            except Exception as e:
                logger.warning(f"Could not load embeddings model: {e}. Falling back to TF-IDF only.")
                self.use_embeddings = False
    
    def add_job_descriptions(self, jobs: List[Dict[str, Any]]) -> None:
        """
        Add job descriptions to the engine for matching.
        
        Expected job format:
        {
            'id': str,
            'title': str,
            'description': str,
            'required_skills': List[str],
            'optional_skills': List[str],
            'experience_level': str (junior/mid/senior),
            'years_required': int,
            'seniority_score': int (0-100)
        }
        """
        # UPDATE jobs instead of REPLACE
        for job in jobs:
            self.jobs[job['id']] = job
        logger.info(f"Added {len(jobs)} job descriptions. Total jobs: {len(self.jobs)}")
    
    def add_candidates(self, candidates: List[Dict[str, Any]]) -> None:
        """
        Add candidates to the engine for matching.
        
        Expected candidate format:
        {
            'id': str,
            'name': str,
            'summary': str,
            'skills': List[str],
            'experience_years': int,
            'education': str,
            'previous_roles': List[str]
        }
        """
        # UPDATE candidates instead of REPLACE
        for candidate in candidates:
            self.candidates[candidate['id']] = candidate
        logger.info(f"Added {len(candidates)} candidates. Total candidates: {len(self.candidates)}")
    
    def _preprocess_text(self, text: str) -> str:
        """Normalize and clean text for matching."""
        text = text.lower()
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def _extract_keywords(self, text: str) -> set:
        """Extract technical keywords from text."""
        # Common technical keywords and frameworks
        tech_keywords = {
            'python', 'javascript', 'java', 'c++', 'csharp', 'go', 'rust', 'ruby',
            'react', 'vue', 'angular', 'fastapi', 'django', 'flask', 'nodejs', 'express',
            'sql', 'mongodb', 'postgresql', 'redis', 'elasticsearch',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
            'git', 'ci', 'cd', 'jenkins', 'gitlab', 'github',
            'rest', 'graphql', 'api', 'microservices', 'architecture',
            'agile', 'scrum', 'tdd', 'testing', 'unittest', 'pytest',
            'machine learning', 'ai', 'nlp', 'deep learning', 'tensorflow', 'pytorch',
            'devops', 'linux', 'windows', 'networking', 'security', 'encryption',
            'database', 'sql', 'nosql', 'orm', 'migration', 'scaling',
            'performance', 'optimization', 'monitoring', 'logging', 'debugging',
            'version control', 'merge', 'rebase', 'branch', 'pull request',
            'html', 'css', 'json', 'xml', 'yaml', 'markdown',
            'leadership', 'mentoring', 'communication', 'collaboration', 'team'
        }
        
        text = self._preprocess_text(text)
        words = set(text.split())
        return words & tech_keywords
    
    def _calculate_keyword_score(self, job: Dict[str, Any], candidate: Dict[str, Any]) -> Tuple[float, List[str], List[str]]:
        """
        Calculate keyword overlap score using TF-IDF.
        
        Returns:
            Tuple of (score, matched_skills, missing_required)
        """
        job_id = job['id']
        candidate_id = candidate['id']
        
        # Combine all text from job
        job_text = self._preprocess_text(
            f"{job.get('title', '')} {job.get('description', '')} "
            f"{' '.join(job.get('required_skills', []))} "
            f"{' '.join(job.get('optional_skills', []))}"
        )
        
        # Combine all text from candidate
        candidate_text = self._preprocess_text(
            f"{candidate.get('summary', '')} "
            f"{' '.join(candidate.get('skills', []))} "
            f"{' '.join(candidate.get('previous_roles', []))}"
        )
        
        # Extract keywords
        job_keywords = self._extract_keywords(job_text)
        candidate_keywords = self._extract_keywords(candidate_text)
        
        # Calculate overlap
        matched = candidate_keywords & job_keywords
        required_missing = set(job.get('required_skills', [])) - candidate_keywords
        
        # Score based on overlap
        if len(job_keywords) == 0:
            keyword_score = 50.0  # Neutral score if no keywords found
        else:
            keyword_score = (len(matched) / len(job_keywords)) * 100
        
        return keyword_score, list(matched), list(required_missing)
    
    def _calculate_semantic_score(self, job: Dict[str, Any], candidate: Dict[str, Any]) -> float:
        """Calculate semantic similarity using embeddings."""
        if not self.use_embeddings or not self.embedding_model:
            return 50.0  # Neutral score if embeddings unavailable
        
        job_text = f"{job.get('title', '')} {job.get('description', '')}"
        candidate_text = f"{candidate.get('summary', '')} {' '.join(candidate.get('skills', []))}"
        
        try:
            job_embedding = self.embedding_model.encode(job_text, convert_to_numpy=True)
            candidate_embedding = self.embedding_model.encode(candidate_text, convert_to_numpy=True)
            
            similarity = cosine_similarity(
                [job_embedding],
                [candidate_embedding]
            )[0][0]
            
            return float(similarity * 100)
        except Exception as e:
            logger.warning(f"Error calculating semantic score: {e}")
            return 50.0
    
    def _calculate_skill_score(self, job: Dict[str, Any], candidate: Dict[str, Any]) -> Tuple[float, int, int]:
        """
        Calculate skill match score based on required vs optional skills.
        
        Returns:
            Tuple of (score, matched_required_count, matched_optional_count)
        """
        candidate_skills = set(skill.lower() for skill in candidate.get('skills', []))
        
        required_skills = set(skill.lower() for skill in job.get('required_skills', []))
        optional_skills = set(skill.lower() for skill in job.get('optional_skills', []))
        
        # Match skills (considering partial matches and variations)
        matched_required = 0
        matched_optional = 0
        
        for req_skill in required_skills:
            if any(req_skill in cand_skill or cand_skill in req_skill 
                   for cand_skill in candidate_skills):
                matched_required += 1
        
        for opt_skill in optional_skills:
            if any(opt_skill in cand_skill or cand_skill in opt_skill 
                   for cand_skill in candidate_skills):
                matched_optional += 1
        
        # Score calculation
        required_count = len(required_skills) if required_skills else 1
        optional_count = len(optional_skills) if optional_skills else 1
        
        # Weight: required skills (80%) + optional skills (20%)
        required_ratio = matched_required / required_count
        optional_ratio = matched_optional / optional_count
        
        skill_score = (required_ratio * 80) + (optional_ratio * 20)
        
        return skill_score, matched_required, matched_optional
    
    def _calculate_experience_score(self, job: Dict[str, Any], candidate: Dict[str, Any]) -> Tuple[float, str]:
        """
        Calculate experience alignment score.
        
        Returns:
            Tuple of (score, experience_details)
        """
        required_years = job.get('years_required', 0)
        candidate_years = candidate.get('experience_years', 0)
        
        job_seniority = job.get('seniority_score', 50)  # 0-100 scale
        
        # Score based on years experience
        if required_years == 0:
            years_ratio = 1.0  # No requirement
        elif candidate_years < required_years:
            # Penalize if under-experienced
            years_ratio = max(0, candidate_years / required_years)
        else:
            # Cap at 1.0 for over-experienced (don't over-reward)
            years_ratio = min(1.0, (required_years / max(1, required_years)) + 
                             (min(candidate_years - required_years, 5) / 10))
        
        experience_score = years_ratio * 100
        experience_details = f"{candidate_years}y (required: {required_years}y)"
        
        return experience_score, experience_details
    
    def _generate_explanation(self, job: Dict[str, Any], candidate: Dict[str, Any], 
                             scores: Dict[str, float], details: Dict[str, Any]) -> Tuple[str, Dict]:
        """Generate human-readable explanation for the match."""
        
        explanation_parts = []
        
        # Skill match explanation
        skill_score = scores['skill_score']
        matched_req = details['matched_required']
        total_req = len(job.get('required_skills', []))
        matched_opt = details['matched_optional']
        total_opt = len(job.get('optional_skills', []))
        
        if total_req > 0:
            explanation_parts.append(
                f"Matched {matched_req}/{total_req} required skills "
                f"({matched_opt}/{total_opt} optional)"
            )
        
        # Experience explanation
        exp_details = details['experience_details']
        explanation_parts.append(f"Experience: {exp_details}")
        
        # Keyword/Technology match
        keywords_matched = len(details['matched_keywords'])
        if keywords_matched > 0:
            explanation_parts.append(
                f"Demonstrated expertise in {', '.join(list(details['matched_keywords'])[:5])}"
                f"{'...' if keywords_matched > 5 else ''}"
            )
        
        # Missing requirements
        missing_req = details['missing_required']
        if missing_req:
            explanation_parts.append(
                f"Missing: {', '.join(missing_req[:3])}"
                f"{'...' if len(missing_req) > 3 else ''}"
            )
        
        # Semantic fit
        semantic_score = scores['semantic_score']
        if semantic_score > 75:
            explanation_parts.append("Strong semantic fit with job requirements")
        elif semantic_score < 50:
            explanation_parts.append("Moderate semantic fit - may require ramp-up")
        
        summary = "; ".join(explanation_parts)
        
        detailed_explanation = {
            "skill_match": {
                "required": f"{matched_req}/{total_req}",
                "optional": f"{matched_opt}/{total_opt}",
                "score": round(skill_score, 1)
            },
            "experience": {
                "candidate_years": candidate.get('experience_years', 0),
                "required_years": job.get('years_required', 0),
                "score": round(scores['experience_score'], 1)
            },
            "technology_match": {
                "matched": list(details['matched_keywords'])[:10],
                "missing": missing_req[:5],
                "score": round(scores['keyword_score'], 1)
            },
            "semantic_alignment": {
                "score": round(semantic_score, 1),
                "assessment": "Strong" if semantic_score > 75 else "Moderate" if semantic_score > 50 else "Weak"
            }
        }
        
        return summary, detailed_explanation
    
    def match_candidates(self, job_id: str) -> List[MatchScore]:
        """
        Match all candidates against a specific job description.
        
        Returns:
            List of MatchScore objects, sorted by overall_score (descending)
        """
        if job_id not in self.jobs:
            raise ValueError(f"Job ID {job_id} not found")
        
        job = self.jobs[job_id]
        matches = []
        
        for candidate_id, candidate in self.candidates.items():
            # Calculate individual scores
            keyword_score, matched_kw, missing_req = self._calculate_keyword_score(job, candidate)
            semantic_score = self._calculate_semantic_score(job, candidate)
            skill_score, matched_req, matched_opt = self._calculate_skill_score(job, candidate)
            experience_score, exp_details = self._calculate_experience_score(job, candidate)
            
            # Combine scores with weights
            # Skills (40%), Experience (30%), Keywords (20%), Semantic (10%)
            overall_score = (
                skill_score * 0.40 +
                experience_score * 0.30 +
                keyword_score * 0.20 +
                semantic_score * 0.10
            )
            
            # Generate explanation
            details = {
                'matched_keywords': matched_kw,
                'missing_required': missing_req,
                'matched_required': matched_req,
                'matched_optional': matched_opt,
                'experience_details': exp_details
            }
            
            summary, detailed_exp = self._generate_explanation(
                job, candidate,
                {
                    'keyword_score': keyword_score,
                    'semantic_score': semantic_score,
                    'skill_score': skill_score,
                    'experience_score': experience_score
                },
                details
            )
            
            match = MatchScore(
                candidate_id=candidate_id,
                job_id=job_id,
                overall_score=round(overall_score, 1),
                keyword_score=round(keyword_score, 1),
                semantic_score=round(semantic_score, 1),
                skill_score=round(skill_score, 1),
                experience_score=round(experience_score, 1),
                explanation_summary=summary,
                detailed_explanation=detailed_exp
            )
            
            matches.append(match)
        
        # Sort by overall score descending
        matches.sort(key=lambda x: x.overall_score, reverse=True)
        
        return matches
    
    def get_match_details(self, job_id: str, candidate_id: str) -> MatchScore:
        """Get detailed match information for a specific candidate-job pair."""
        matches = self.match_candidates(job_id)
        for match in matches:
            if match.candidate_id == candidate_id:
                return match
        raise ValueError(f"Match not found for job {job_id} and candidate {candidate_id}")
