# Candidate-Job Matcher 🎯

An intelligent, scalable system for ranking candidates against job descriptions with meaningful, explainable matching results.

## 📋 Table of Contents

- [Overview](#overview)
- [Matching Approach](#matching-approach)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Frontend Features](#frontend-features)
- [Data Format](#data-format)
- [Scalability](#scalability)
- [Edge Cases](#edge-cases)
- [Design Decisions](#design-decisions)

---

## Overview

### What It Does

This system solves the **candidate-job matching problem** by:

1. **Ingests** job descriptions and candidate profiles (JSON, CSV, or API)
2. **Ranks** candidates for each job using a hybrid matching approach
3. **Explains** each ranking with meaningful, human-readable reasoning
4. **Exposes** results via REST APIs and a web UI
5. **Scales** to hundreds of thousands of candidates with architectural optimization

### Key Features

✅ **Hybrid Matching Algorithm** - Combines multiple matching strategies  
✅ **Explainable Results** - Clear reasoning for each ranking  
✅ **File Upload Support** - JSON and CSV import for jobs and candidates  
✅ **REST API** - Complete endpoints for programmatic access  
✅ **Web UI** - Real-time dashboard for exploring matches  
✅ **Docker Deployment** - Single command deployment  
✅ **Production-Ready** - Caching, error handling, validation

---

## Matching Approach

### The Hybrid Matching Engine

The system uses a **weighted combination** of four distinct matching strategies:

#### 1. **Skill Matching (40% weight)** 🎯

- **Method**: Exact and partial skill matching
- **Scoring**: Required skills weighted at 80%, optional at 20%
- **Example**:
  - Job requires: [Python, FastAPI, Docker, Kubernetes]
  - Candidate has: [Python, FastAPI, Docker]
  - Match: 3/4 = 75% of required skills
  - Score: `(0.75 * 80) + (0 * 20) = 60`

#### 2. **Experience Alignment (30% weight)** 📚

- **Method**: Years of experience comparison with seniority adjustment
- **Scoring**:
  - Full credit if experience ≥ required years
  - Penalized if experience < required years
  - Bonus points for years over requirement (capped)
- **Example**:
  - Job requires: 5 years
  - Candidate has: 7 years
  - Score: 100/100

#### 3. **Keyword/Technology Overlap (20% weight)** 💻

- **Method**: TF-IDF (Term Frequency-Inverse Document Frequency)
- **Scoring**: Percentage of job keywords present in candidate profile
- **Example**:
  - Job keywords: {Python, React, AWS, Microservices, Docker}
  - Candidate demonstrates: {Python, Docker, Microservices}
  - Match: 3/5 = 60%

#### 4. **Semantic Similarity (10% weight)** 🧠

- **Method**: Sentence-Transformers embeddings (all-MiniLM-L6-v2)
- **Scoring**: Cosine similarity between job description and candidate summary
- **Example**:
  - Captures context beyond keywords
  - "Building scalable systems" matches job requiring "cloud architecture"
  - Score: 0.75 cosine similarity = 75%

### Final Score Calculation

```
Overall Score = (Skill × 0.40) + (Experience × 0.30) + (Keywords × 0.20) + (Semantic × 0.10)
```

### Why This Approach?

| Strategy        | Pros               | Cons                        | Solution            |
| --------------- | ------------------ | --------------------------- | ------------------- |
| Skills Only     | Clear requirements | Misses soft skills, context | Add semantic layer  |
| Experience Only | Resume validation  | Assumes learning curve      | Combine with skills |
| Keywords Only   | Fast, indexed      | No understanding            | Use embeddings      |
| Semantic Only   | Contextual         | Slow, expensive             | Use as enhancement  |

**Hybrid = Best of All Worlds** ✨

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd candidate-matcher

# Run with Docker Compose
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:8000
```

**First run takes 2-3 minutes** (downloads ML models for semantic matching)

### Option 2: Local Development

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn app.main:app --reload
# Server runs at http://localhost:8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# Client runs at http://localhost:3000
```

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  Dashboard │ Upload │ Jobs │ Candidates │ Match Results │
└──────────────────────┬──────────────────────────────────┘
                       │
                  HTTP/REST
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  FastAPI Backend                        │
│  ┌──────────────┬──────────────┬──────────────────────┐ │
│  │   API        │  Matching    │   Database           │ │
│  │  Endpoints   │  Engine      │   (SQLite/Postgres)  │ │
│  └──────────────┴──────────────┴──────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**

- `FastAPI` - Modern Python web framework
- `SQLAlchemy` - ORM for database operations
- `scikit-learn` - TF-IDF vectorization
- `sentence-transformers` - Semantic embeddings
- `uvicorn` - ASGI server
- `Pydantic` - Data validation

**Frontend:**

- `React 18` - UI framework
- `Axios` - HTTP client
- `CSS3` - Styling

**Infrastructure:**

- `Docker` - Containerization
- `Docker Compose` - Multi-container orchestration
- `SQLite` (default) - Lightweight database

---

## API Documentation

### Base URL

`http://localhost:8000`

### Health & Status

#### GET `/health`

Check system health

```bash
curl http://localhost:8000/health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00"
}
```

#### GET `/stats`

Get system statistics

```bash
curl http://localhost:8000/stats
```

Response:

```json
{
  "total_jobs": 5,
  "total_candidates": 10,
  "database_type": "SQLite",
  "matching_engine": "Hybrid (TF-IDF + Semantic + Skills + Experience)"
}
```

### Job Descriptions

#### POST `/jobs`

Create a new job

```bash
curl -X POST http://localhost:8000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Engineer",
    "company": "TechCorp",
    "description": "Looking for...",
    "required_skills": ["Python", "FastAPI", "Docker"],
    "optional_skills": ["Kubernetes", "AWS"],
    "experience_level": "senior",
    "years_required": 7
  }'
```

#### GET `/jobs`

List all jobs

```bash
curl http://localhost:8000/jobs
```

#### GET `/jobs/{job_id}`

Get specific job

```bash
curl http://localhost:8000/jobs/jd-001
```

#### POST `/jobs/upload`

Upload jobs from JSON/CSV file

```bash
curl -X POST -F "file=@jobs.json" \
  http://localhost:8000/jobs/upload
```

### Candidates

#### POST `/candidates`

Create a new candidate

```bash
curl -X POST http://localhost:8000/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "summary": "Senior backend engineer with 8 years...",
    "skills": ["Python", "FastAPI", "Docker"],
    "experience_years": 8
  }'
```

#### GET `/candidates`

List all candidates

```bash
curl http://localhost:8000/candidates
```

#### GET `/candidates/{candidate_id}`

Get specific candidate

```bash
curl http://localhost:8000/candidates/cand-001
```

#### POST `/candidates/upload`

Upload candidates from JSON/CSV file

```bash
curl -X POST -F "file=@candidates.json" \
  http://localhost:8000/candidates/upload
```

### Matching

#### GET `/match/{jd_id}`

Get ranked candidates for a job

```bash
curl "http://localhost:8000/match/jd-001?limit=10"
```

Response:

```json
{
  "job_id": "jd-001",
  "job_title": "Senior Backend Engineer",
  "total_candidates": 10,
  "timestamp": "2024-01-15T10:30:00",
  "results": [
    {
      "candidate_id": "cand-001",
      "candidate_name": "Alice Johnson",
      "rank": 1,
      "overall_score": 89.5,
      "skill_score": 90.0,
      "experience_score": 85.0,
      "keyword_score": 92.0,
      "semantic_score": 78.5,
      "explanation_summary": "Matched 7/8 required skills; 8y exp (required 7y); Strong match on technologies",
      "detailed_explanation": {
        "skill_match": {
          "required": "7/8",
          "optional": "5/6",
          "score": 90.0
        },
        "experience": {
          "candidate_years": 8,
          "required_years": 7,
          "score": 85.0
        },
        "technology_match": {
          "matched": ["Python", "FastAPI", "Docker", "Kubernetes", "PostgreSQL"],
          "missing": ["GraphQL"],
          "score": 92.0
        },
        "semantic_alignment": {
          "score": 78.5,
          "assessment": "Strong"
        }
      }
    },
    ...
  ]
}
```

#### GET `/match/{jd_id}/{candidate_id}`

Get detailed match explanation

```bash
curl http://localhost:8000/match/jd-001/cand-001
```

Response includes full job requirements, candidate profile, and detailed analysis

#### GET `/match/{jd_id}/summary`

Get match summary statistics

```bash
curl http://localhost:8000/match/jd-001/summary
```

Response:

```json
{
  "job_id": "jd-001",
  "job_title": "Senior Backend Engineer",
  "total_matches": 10,
  "score_statistics": {
    "average": 65.2,
    "min": 35.1,
    "max": 89.5,
    "median": 62.3
  },
  "top_candidates": [
    {
      "name": "Alice Johnson",
      "score": 89.5
    }
  ]
}
```

### Batch Operations

#### POST `/batch/match-all`

Match all candidates against all jobs

```bash
curl -X POST http://localhost:8000/batch/match-all
```

---

## Frontend Features

### Dashboard

- System statistics
- Quick action buttons
- Overview of jobs and candidates

### Upload Page

- Drag-and-drop file upload
- Support for JSON and CSV formats
- Validation and error messages
- Real-time feedback on uploads

### Jobs Page

- Browse all job descriptions
- View job details
- Click to start matching

### Candidates Page

- View all candidate profiles
- See skills and experience
- Filter and search

### Match Results

- Ranked list of candidates for a job
- Visual score representation
- Four-component score breakdown (Skills, Experience, Keywords, Semantic)
- Expandable detailed analysis
- Direct comparison of job requirements vs candidate profile

---

## Data Format

### JSON Format

**Jobs:**

```json
{
  "id": "jd-001",
  "title": "Senior Backend Engineer",
  "company": "TechCorp Inc",
  "description": "We are looking for an experienced engineer...",
  "required_skills": ["Python", "FastAPI", "PostgreSQL"],
  "optional_skills": ["Kubernetes", "AWS"],
  "experience_level": "senior",
  "years_required": 7,
  "seniority_score": 85,
  "salary_range": "$150,000 - $220,000",
  "location": "San Francisco, CA"
}
```

**Candidates:**

```json
{
  "id": "cand-001",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "+1-555-0101",
  "summary": "Senior Backend Engineer with 8 years of experience...",
  "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
  "experience_years": 8,
  "education": "MS Computer Science, Stanford",
  "certifications": ["AWS Solutions Architect"],
  "previous_roles": ["Senior Backend Engineer at CloudTech"],
  "location": "Mountain View, CA",
  "linkedin_url": "https://linkedin.com/in/alice",
  "github_url": "https://github.com/alice"
}
```

### CSV Format

**Jobs CSV:**

```csv
title,description,required_skills,optional_skills,years_required,company,location
Senior Backend Engineer,"Looking for...",Python;FastAPI;Docker,Kubernetes;AWS,7,TechCorp,"San Francisco, CA"
```

**Candidates CSV:**

```csv
name,summary,skills,experience_years,email,education,location
Alice Johnson,"Senior engineer with 8y experience",Python;FastAPI;Docker,8,alice@example.com,"MS CS, Stanford","Mountain View, CA"
```

---

## Scalability

### Current Architecture Performance

**Scale:** 100k candidates per job

**Bottlenecks & Solutions:**

| Component                | Bottleneck                 | Current Limit   | Solution                  |
| ------------------------ | -------------------------- | --------------- | ------------------------- |
| **In-Memory Storage**    | Jobs/candidates in RAM     | ~10k candidates | Database indexing (1M+)   |
| **Semantic Embeddings**  | Slow embedding computation | ~1k/sec         | Batch processing, caching |
| **Matching Computation** | O(n) candidates per job    | ~50k candidates | Pre-computed embeddings   |
| **API Response Time**    | All rankings on request    | 5-10 seconds    | Async workers, caching    |

### Scaling to 100k+ Candidates

#### Phase 1: Database Optimization (Current → 100k)

```python
# Strategy: Move from in-memory to proper database
1. PostgreSQL with indexed columns
   - Candidates: Index on skills, location, experience_years
   - Time complexity: O(log n) for lookups
   - Result: 100k candidates, <1 sec query

2. Full-text search for text fields
   - Index job descriptions and summaries
   - TF-IDF pre-computation
   - Result: Keyword matching in <100ms

3. Caching layer (Redis)
   - Cache embeddings for candidates
   - Cache match results
   - TTL-based invalidation
   - Result: Repeat queries in <10ms
```

#### Phase 2: Computational Optimization (100k → 1M)

```python
# Strategy: Parallel and asynchronous processing

1. Batch Embedding Pre-computation
   - Pre-compute all candidate embeddings offline
   - Store in vector database (Pinecone, Milvus)
   - Matching: nearest neighbor search O(log n)
   - Result: 1M candidates, <500ms match

2. Distributed Matching
   - MapReduce-style matching across workers
   - Each worker handles chunk of candidates
   - Results aggregated and sorted
   - Framework: Celery with RabbitMQ/Redis

3. Approximate Nearest Neighbor (ANN)
   - Use FAISS for fast vector search
   - Trade: Perfect accuracy for 10x speed
   - Result: Sub-100ms matching

Architecture:
┌──────────────┐
│  API Server  │
└──────┬───────┘
       │
    ┌──┴──┐
    │     └─────────────────┐
    │                       │
┌───▼────────┐      ┌──────▼─────┐
│  Cache     │      │  Queue     │
│  (Redis)   │      │  (RabbitMQ)│
└────────────┘      └──────┬─────┘
                           │
       ┌─────────┬─────────┼─────────┬─────────┐
       │         │         │         │         │
    ┌──▼──┐  ┌──▼──┐  ┌──▼──┐  ┌──▼──┐  ┌──▼──┐
    │Work.│  │Work.│  │Work.│  │Work.│  │Work.│
    │  1  │  │  2  │  │  3  │  │  4  │  │  N  │
    └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘
       │        │        │        │        │
       └────────┬────────┴────────┴────────┘
                │
       ┌────────▼────────┐
       │  Vector DB      │
       │  (Embeddings)   │
       └─────────────────┘
```

#### Phase 3: Advanced Optimization (1M → 10M+)

```python
# Strategy: Hierarchical matching and filtering

1. Multi-stage Ranking
   Stage 1: Fast filters (skill overlap > 30%)
   Stage 2: Experience alignment (within ±3 years)
   Stage 3: Full semantic matching
   Reduces candidates: 1M → 100k → 10k → top 100
   Time: 100ms + 200ms + 500ms = 800ms

2. Skill-based Sharding
   Partition candidates by required skills
   Match only relevant partition
   Result: 90% reduction in candidates

3. Hybrid Storage
   - Hot data: Redis (recent jobs)
   - Warm data: PostgreSQL (main cache)
   - Cold data: S3 (historical data)
```

### Performance Metrics (Projected)

| Scale | Architecture  | Avg Response Time | Infrastructure     |
| ----- | ------------- | ----------------- | ------------------ |
| 10k   | Single server | <500ms            | 1 server (4GB RAM) |
| 100k  | With caching  | <2 sec            | 2 servers + Redis  |
| 1M    | Distributed   | <1 sec            | 5-10 workers + DB  |
| 10M   | Multi-stage   | <3 sec            | Full stack deploy  |

### Deployment Options

```bash
# Single Server (10k-100k)
docker-compose up

# Kubernetes Cluster (100k-1M)
kubectl apply -f k8s/deployment.yaml

# Cloud Native (1M+)
# AWS: ECS + RDS + ElastiCache
# GCP: Cloud Run + Cloud SQL + Memorystore
# Azure: Container Instances + Cosmos DB + Cache for Redis
```

### Database Schema for Scaling

```sql
-- Indexed for fast lookups
CREATE TABLE candidates (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    summary TEXT NOT NULL,
    experience_years INT,
    location VARCHAR,
    created_at TIMESTAMP,

    INDEX idx_experience (experience_years),
    INDEX idx_location (location),
    FULLTEXT INDEX idx_summary (summary)
);

-- Skills in separate table for filtering
CREATE TABLE candidate_skills (
    candidate_id VARCHAR,
    skill VARCHAR,
    proficiency VARCHAR,

    PRIMARY KEY (candidate_id, skill),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    INDEX idx_skill (skill)
);

-- Pre-computed embeddings
CREATE TABLE candidate_embeddings (
    candidate_id VARCHAR PRIMARY KEY,
    embedding VECTOR(384),  -- all-MiniLM-L6-v2 output
    version INT,
    computed_at TIMESTAMP,

    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    INDEX idx_embedding (embedding) USING HNSW
);

-- Match cache
CREATE TABLE match_cache (
    job_id VARCHAR,
    candidate_id VARCHAR,
    score FLOAT,
    computed_at TIMESTAMP,
    valid_until TIMESTAMP,

    PRIMARY KEY (job_id, candidate_id),
    INDEX idx_valid (valid_until)
);
```

---

## Edge Cases

### Handling Missing or Incomplete Data

#### 1. **Missing Skills**

```python
# Before: Job requires ["Python", "React", "Docker"]
# Candidate has: [null/empty]

# Solution: Default score components
- Skill score: 0 (no skills listed)
- Semantic score: Still computed (can match from summary)
- Overall: Candidate ranked low but not excluded
```

#### 2. **Vague Job Descriptions**

```python
# "Looking for a good engineer"
# Problem: No specific skills or requirements

# Solution:
- Minimum score baseline (40%) - profile exists
- Emphasize semantic matching (weights increased)
- Rank by experience and general relevance
- Flag as low-confidence match in UI
```

#### 3. **Missing Experience Years**

```python
# Candidate: experience_years = null/0
# Job: requires 5 years

# Solution:
- Treat as 0 years
- Penalize experience score (0/5)
- Use skills and semantic matching as primary signals
- Flag as "junior" in results
```

#### 4. **Extreme Outliers**

```python
# Candidate with 50 years experience (impossible in field)
# Solution: Cap at reasonable maximum (40 years)

# Candidate with 1000+ skills
# Solution: Take top 50 by relevance, warn about suspicious data
```

#### 5. **Duplicate Candidates/Jobs**

```python
# Same person uploaded multiple times with different IDs
# Solution:
- Fuzzy matching on name/email
- Warn but don't auto-merge
- User can manually consolidate

# Same job posted multiple times
# Solution: Treat as separate entries (allows historical tracking)
```

#### 6. **Location Mismatches**

```python
# Job: "San Francisco, CA"
# Candidate: "New York, NY"

# Current: Included with lower semantic score
# Future: Could add explicit location matching (0.1 weight)
```

#### 7. **Skill Name Variations**

```python
# Job requires: "Python"
# Candidate has: "python", "PYTHON", "Python 3.11", "python/django"

# Solution: Case-insensitive, substring matching
# "python" in any candidate skill = match
```

### Error Handling

```python
# All endpoints return meaningful error messages:

# 404 Not Found
{"detail": "Job jd-999 not found"}

# 400 Bad Request
{"detail": "File must be JSON or CSV"}

# 500 Internal Server
{"detail": "Error during matching: [specific error]"}

# Validation errors
{"detail": "Invalid email format for candidate"}
```

---

## Design Decisions

### 1. Why Four Matching Strategies?

**Considered Alternatives:**

| Approach            | Why Not                           | Why This                          |
| ------------------- | --------------------------------- | --------------------------------- |
| **Rule-based only** | Too rigid, misses nuance          | Flexible to changes               |
| **ML model only**   | Black box, requires training data | Explainable, no training          |
| **LLM-based**       | Expensive, non-deterministic      | Lightweight, fast                 |
| **Hybrid**          | More complex                      | Best accuracy + explainability ✅ |

### 2. Why SQLite vs PostgreSQL?

**For Development:**

- ✅ Zero configuration
- ✅ Single file database
- ✅ Perfect for testing

**For Production (>100k candidates):**

- ❌ Single-threaded writing
- ❌ No advanced features
- → **Switch to PostgreSQL**

### 3. Why Sentence-Transformers for Embeddings?

**Alternatives:**

- OpenAI API: Expensive ($0.02/1k tokens)
- BERT: Slow, large model
- TF-IDF only: Limited semantic understanding

**Choice: `all-MiniLM-L6-v2`**

- ✅ Fast (1000 embeddings/sec)
- ✅ Small (22MB)
- ✅ Free, local inference
- ✅ Good quality for job matching

### 4. Why This Weighting (40/30/20/10)?

```
Skills (40%): Most direct match to job
Experience (30%): Correlates with ability to perform
Keywords (20%): Additional validation
Semantic (10%): Catch context misses

Total = 100%
```

Rationale:

- Skills are objective and critical
- Experience is reliable secondary signal
- Keywords provide quick validation
- Semantic adds safety net

Could be tuned based on feedback

### 5. Why REST API vs GraphQL?

**REST Benefits:**

- ✅ Simpler for this use case
- ✅ Better caching (HTTP cache layers)
- ✅ Easier to understand
- ✅ Standard tooling (Postman, curl)

**GraphQL Benefits:**

- Flexible queries (not needed here)
- Less over-fetching (not significant)

### 6. Why React Frontend?

**Alternatives:**

- Vue: Lighter, but less ecosystem
- Angular: Over-engineered
- Plain HTML: Tedious for interactivity

**Choice: React**

- ✅ Large ecosystem
- ✅ Component reusability
- ✅ Great for interactive features

---

## Testing

### Running Tests

```bash
# Backend unit tests
cd backend
pytest

# With coverage
pytest --cov=app tests/

# Frontend tests
cd frontend
npm test
```

### Test Examples

```python
# test_matching_engine.py

def test_skill_matching():
    """Test skill match scoring"""
    job = {
        'id': 'test-job',
        'required_skills': ['Python', 'FastAPI'],
        'optional_skills': ['Docker']
    }
    candidate = {
        'id': 'test-cand',
        'skills': ['Python', 'FastAPI']
    }

    engine = MatchingEngine()
    engine.add_job_descriptions([job])
    engine.add_candidates([candidate])

    matches = engine.match_candidates('test-job')
    assert matches[0].skill_score == 80.0  # 2/2 required, 0/1 optional
```

---

## Troubleshooting

### Common Issues

**1. Embeddings model download hangs**

```bash
# Solution: Pre-download the model
python -m sentence_transformers.util import pytorch_cos_sim
from sentence_transformers import SentenceTransformer
SentenceTransformer('all-MiniLM-L6-v2')
```

**2. Database locked (SQLite)**

```bash
# Solution: Use WAL mode
# Or: Switch to PostgreSQL for production
```

**3. High memory usage**

```bash
# Solutions:
# - Enable caching (Redis)
# - Use batch processing
# - Pre-compute embeddings
```

---

## Future Enhancements

### Phase 2: Advanced Features

- [ ] LLM-based explanation enhancement
- [ ] Real-time candidate ranking as JD is being written
- [ ] Skill taxonomy/ontology for better matching
- [ ] Interview scheduling integration
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics and reporting

### Phase 3: Enterprise Features

- [ ] Multi-tenant support
- [ ] Custom matching weightings per company
- [ ] SSO integration
- [ ] Audit logging
- [ ] API rate limiting
- [ ] Advanced permission system

---

## Contributing

Contributions welcome! Areas:

- Improve matching accuracy
- Add new data sources (LinkedIn, GitHub API)
- Performance optimizations
- UI enhancements
- Additional language support

---

## License

MIT License - see LICENSE file

---

## Support

- 📧 Email: support@candidatematcher.com
- 🐛 Issues: GitHub Issues
- 📚 Docs: See `/docs` folder

---

## Project Structure

```
candidate-matcher/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application
│   │   ├── models.py              # Pydantic models
│   │   ├── database.py            # Database layer
│   │   └── matching_engine.py     # Core matching logic
│   ├── tests/
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── App.js                 # Main React component
│   │   ├── App.css                # Styles
│   │   └── components/            # React components
│   ├── public/
│   └── package.json
├── Dockerfile                    # Backend container
├── frontend.Dockerfile           # Frontend container
├── docker-compose.yml            # Multi-container setup
└── README.md                     # This file
```

---

## Summary

This system demonstrates a **thoughtful, scalable approach** to candidate-job matching that balances:

✅ **Accuracy** through hybrid methodology  
✅ **Explainability** with detailed reasoning  
✅ **Performance** with caching and optimization  
✅ **Scalability** from 10k to 10M candidates  
✅ **Usability** with intuitive UI and APIs

The matching approach prioritizes **skills and experience** while using **semantic understanding** to catch nuanced fits that keyword matching would miss. The architecture supports growth from a single server to distributed systems handling millions of matching operations daily.

---
