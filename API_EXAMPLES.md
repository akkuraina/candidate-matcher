# API Usage Examples

## 1. Basic Setup

All API calls use the base URL: `http://localhost:8000`

## 2. Health and Status

### Check if API is running

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

### Get system statistics

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

---

## 3. Managing Job Descriptions

### Create a new job

```bash
curl -X POST http://localhost:8000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Data Engineer",
    "company": "DataCorp",
    "description": "Looking for an experienced data engineer to design and optimize our data pipelines. Must have experience with big data technologies and cloud platforms.",
    "required_skills": ["Python", "Spark", "SQL", "AWS"],
    "optional_skills": ["Kafka", "Airflow", "Scala"],
    "experience_level": "senior",
    "years_required": 6,
    "seniority_score": 80,
    "salary_range": "$160,000 - $240,000",
    "location": "Seattle, WA"
  }'
```

Response:

```json
{
  "id": "jd-1234567a",
  "message": "Job created successfully"
}
```

### List all jobs

```bash
curl http://localhost:8000/jobs
```

Response:

```json
{
  "total": 5,
  "jobs": [
    {
      "id": "jd-001",
      "title": "Senior Backend Engineer",
      "description": "We are looking for...",
      "required_skills": ["Python", "FastAPI"],
      "optional_skills": ["Kubernetes"],
      "years_required": 7,
      "seniority_score": 85
    }
  ]
}
```

### Get a specific job

```bash
curl http://localhost:8000/jobs/jd-001
```

### Upload jobs from file

```bash
curl -X POST -F "file=@jobs.json" \
  http://localhost:8000/jobs/upload
```

**jobs.json format:**

```json
[
  {
    "id": "jd-custom-001",
    "title": "Machine Learning Engineer",
    "description": "Build prediction models",
    "required_skills": ["Python", "TensorFlow", "SQL"],
    "optional_skills": ["PyTorch", "Kubernetes"],
    "years_required": 3,
    "experience_level": "mid"
  }
]
```

---

## 4. Managing Candidate Profiles

### Create a new candidate

```bash
curl -X POST http://localhost:8000/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Chen",
    "email": "sarah.chen@email.com",
    "phone": "+1-555-0200",
    "summary": "Software engineer with 6 years of experience building cloud-native applications. Expert in Python, Go, and microservices architecture. Led teams at two startups. Passionate about DevOps and infrastructure automation.",
    "skills": ["Python", "Go", "Docker", "Kubernetes", "AWS", "PostgreSQL"],
    "experience_years": 6,
    "education": "MS Computer Science, UC Berkeley",
    "certifications": ["AWS Solutions Architect", "Certified Kubernetes Administrator"],
    "previous_roles": ["Senior Engineer at CloudStartup", "Engineer at FinTechCo"],
    "location": "San Jose, CA",
    "linkedin_url": "https://linkedin.com/in/sarahchen",
    "github_url": "https://github.com/sarahchen"
  }'
```

Response:

```json
{
  "id": "cand-abcd1234",
  "message": "Candidate created successfully"
}
```

### List all candidates

```bash
curl http://localhost:8000/candidates
```

### Get a specific candidate

```bash
curl http://localhost:8000/candidates/cand-001
```

### Upload candidates from file

```bash
curl -X POST -F "file=@candidates.json" \
  http://localhost:8000/candidates/upload
```

**candidates.json format:**

```json
[
  {
    "id": "cand-custom-001",
    "name": "John Developer",
    "summary": "Full stack engineer with 5 years experience",
    "skills": ["JavaScript", "React", "Node.js", "PostgreSQL"],
    "experience_years": 5,
    "email": "john@example.com",
    "education": "BS Computer Science"
  }
]
```

---

## 5. Getting Match Results

### Get ranked candidates for a job

```bash
curl "http://localhost:8000/match/jd-001?limit=5"
```

Response:

```json
{
  "job_id": "jd-001",
  "job_title": "Senior Backend Engineer",
  "total_candidates": 10,
  "timestamp": "2024-01-15T10:35:00",
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
          "matched": ["Python", "FastAPI", "Docker", "Kubernetes"],
          "missing": ["GraphQL"],
          "score": 92.0
        },
        "semantic_alignment": {
          "score": 78.5,
          "assessment": "Strong"
        }
      }
    },
    {
      "candidate_id": "cand-005",
      "candidate_name": "Emma Wilson",
      "rank": 2,
      "overall_score": 76.2,
      "skill_score": 85.0,
      "experience_score": 75.0,
      "keyword_score": 68.0,
      "semantic_score": 72.0,
      "explanation_summary": "Matched 6/8 required skills; Good experience match; Full stack background valuable"
    }
  ]
}
```

### Get detailed match explanation

```bash
curl http://localhost:8000/match/jd-001/cand-001
```

Response includes comprehensive details about why the candidate ranked at that position, including:

- Complete candidate profile
- Full job requirements
- Detailed skill-by-skill comparison
- Experience analysis
- Technology match details
- Semantic alignment assessment

### Get match statistics

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
    },
    {
      "name": "Emma Wilson",
      "score": 76.2
    }
  ]
}
```

---

## 6. Batch Operations

### Match all candidates against all jobs

```bash
curl -X POST http://localhost:8000/batch/match-all
```

Response:

```json
{
  "total_jobs": 5,
  "total_candidates": 10,
  "timestamp": "2024-01-15T10:40:00",
  "matches": {
    "jd-001": {
      "job_title": "Senior Backend Engineer",
      "candidate_count": 10,
      "top_candidates": [
        {
          "id": "cand-001",
          "name": "Alice Johnson",
          "score": 89.5
        },
        {
          "id": "cand-005",
          "name": "Emma Wilson",
          "score": 76.2
        }
      ]
    },
    "jd-002": {
      "job_title": "Frontend React Developer",
      "candidate_count": 10,
      "top_candidates": [
        {
          "id": "cand-002",
          "name": "Bob Smith",
          "score": 92.1
        }
      ]
    }
  }
}
```

---

## 7. CSV Upload Examples

### Jobs CSV Format

```csv
title,description,required_skills,optional_skills,years_required,company,location,experience_level
Senior Backend Engineer,"Experienced engineer needed",Python;FastAPI;Docker,Kubernetes;AWS,7,TechCorp,"San Francisco, CA",senior
Frontend Developer,"React specialist",React;JavaScript;HTML,TypeScript;Redux,3,WebDesign,"Remote",mid
```

### Candidates CSV Format

```csv
name,summary,skills,experience_years,email,education,location
Alice Johnson,"Backend expert with 8y experience",Python;FastAPI;Docker,8,alice@example.com,"MS CS, Stanford","Mountain View, CA"
Bob Smith,"React specialist with 4y experience",React;JavaScript;TypeScript,4,bob@example.com,"BS CS, UC Berkeley","San Francisco, CA"
```

---

## 8. Error Handling

### Job Not Found

```bash
curl http://localhost:8000/match/jd-999
```

Response:

```json
{
  "detail": "Job not found"
}
```

### Invalid File Format

```bash
curl -X POST -F "file=@data.txt" \
  http://localhost:8000/jobs/upload
```

Response:

```json
{
  "detail": "File must be JSON or CSV"
}
```

### Validation Error

```bash
curl -X POST http://localhost:8000/candidates \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}' # Missing required fields
```

Response:

```json
{
  "detail": "2 validation errors..."
}
```

---

## 9. Real-World Workflow

### Complete hiring workflow example

```bash
#!/bin/bash

# 1. Create a job posting
JOB_RESPONSE=$(curl -s -X POST http://localhost:8000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "DevOps Engineer",
    "description": "Infrastructure specialist needed",
    "required_skills": ["Docker", "Kubernetes", "AWS"],
    "years_required": 4
  }')

JOB_ID=$(echo $JOB_RESPONSE | jq -r '.id')
echo "Created job: $JOB_ID"

# 2. Add candidates (typically uploaded in bulk)
curl -s -X POST -F "file=@candidates.json" \
  http://localhost:8000/candidates/upload

# 3. Get ranked candidates
echo "Top candidates for $JOB_ID:"
curl -s "http://localhost:8000/match/$JOB_ID?limit=3" | \
  jq '.results[] | {name: .candidate_name, score: .overall_score}'

# 4. Get detailed analysis for top candidate
TOP_CANDIDATE=$(curl -s "http://localhost:8000/match/$JOB_ID?limit=1" | \
  jq -r '.results[0].candidate_id')

echo "Detailed analysis for top candidate:"
curl -s "http://localhost:8000/match/$JOB_ID/$TOP_CANDIDATE" | \
  jq '.detailed_explanation'
```

---

## 10. Integration with Other Systems

### Python Client Example

```python
import requests

API_URL = "http://localhost:8000"

# Create job
job_data = {
    "title": "Backend Engineer",
    "required_skills": ["Python", "FastAPI"],
    "years_required": 3
}
response = requests.post(f"{API_URL}/jobs", json=job_data)
job_id = response.json()["id"]

# Get matches
matches = requests.get(f"{API_URL}/match/{job_id}").json()

for match in matches["results"]:
    print(f"{match['candidate_name']}: {match['overall_score']}%")
```

### JavaScript/Node.js Example

```javascript
const axios = require("axios");

const API_URL = "http://localhost:8000";

async function getMatches(jobId) {
  try {
    const response = await axios.get(`${API_URL}/match/${jobId}`);
    return response.data.results;
  } catch (error) {
    console.error("Error:", error);
  }
}

getMatches("jd-001").then((matches) => {
  matches.forEach((match) => {
    console.log(`${match.candidate_name}: ${match.overall_score}%`);
  });
});
```

---

## 11. Performance Tips

- **pagination**: Add `?limit=50` to match queries to reduce response size
- **Caching**: Match results are automatically cached after first request
- **Batch uploads**: Upload candidates in batches of 1000+ for efficiency
- **Endpoint selection**: Use `/match/{jd_id}/summary` for statistics instead of full match details
