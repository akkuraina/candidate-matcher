# Quick Start Guide

## 🚀 Get Running in 2 Minutes

### Docker (Easiest)

```bash
# Clone/navigate to project
cd candidate-matcher

# Start everything
docker-compose up

# Open in browser
# Frontend: http://localhost:3000
# API: http://localhost:8000
```

**That's it!** The system loads with 5 sample jobs and 10 sample candidates.

---

## 🎯 Try It Now

### 1. Open the Dashboard

👉 Visit http://localhost:3000

### 2. Browse Jobs

Click "Jobs" tab to see 5 sample job descriptions

### 3. View Matches

Click "View Matches" on any job to see ranked candidates

### 4. See Detailed Analysis

Click on a candidate to see why they matched

---

## 📊 Sample Data

| Jobs                     | Candidates                      |
| ------------------------ | ------------------------------- |
| Senior Backend Engineer  | Alice Johnson (8y Backend)      |
| Frontend React Developer | Bob Smith (4y Frontend)         |
| DevOps Engineer          | Carol Davis (5y DevOps)         |
| Data Scientist           | David Chen (5y Data Science)    |
| Full Stack Developer     | Emma Wilson (6y Full Stack)     |
|                          | Frank Miller (2y Junior)        |
|                          | Grace Lee (4y DevOps)           |
|                          | Henry Zhang (7y Senior)         |
|                          | Isabella Martinez (5y Frontend) |
|                          | Jack Thompson (1.5y Junior)     |

---

## 🔧 API Quick Reference

### Check System Status

```bash
curl http://localhost:8000/stats
```

### Get Matches for a Job

```bash
curl http://localhost:8000/match/jd-001
```

### Get Detailed Match Info

```bash
curl http://localhost:8000/match/jd-001/cand-001
```

### Upload Your Own Data

```bash
# Jobs (JSON)
curl -X POST -F "file=@jobs.json" http://localhost:8000/jobs/upload

# Candidates (JSON)
curl -X POST -F "file=@candidates.json" http://localhost:8000/candidates/upload
```

---

## 📄 File Formats

### JSON (recommended)

**Job:**

```json
{
  "title": "Senior Engineer",
  "description": "Looking for...",
  "required_skills": ["Python", "Docker"],
  "optional_skills": ["Kubernetes"],
  "years_required": 5
}
```

**Candidate:**

```json
{
  "name": "John Doe",
  "summary": "Engineer with 7 years experience",
  "skills": ["Python", "Docker", "Kubernetes"],
  "experience_years": 7
}
```

### CSV

```csv
title,description,required_skills
Senior Engineer,"Looking for...",Python;Docker
```

---

## 🧠 How Matching Works

The system ranks candidates using 4 factors:

| Factor         | Weight | Example                       |
| -------------- | ------ | ----------------------------- |
| **Skills**     | 40%    | "Has 7 of 8 required skills"  |
| **Experience** | 30%    | "8 years (required 5)"        |
| **Keywords**   | 20%    | "Matches Python, Docker, etc" |
| **Semantic**   | 10%    | "Understands domain concepts" |

**Overall Score = (Skills × 0.4) + (Experience × 0.3) + (Keywords × 0.2) + (Semantic × 0.1)**

---

## 🛠️ Local Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# Frontend (in another terminal)
cd frontend
npm install
npm start
```

---

## 📚 Documentation

- **[README.md](README.md)** - Full documentation, architecture, scalability
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Cloud deployment, production setup
- **[API_EXAMPLES.md](API_EXAMPLES.md)** - API usage examples, integration guides

---

## 🎯 Common Tasks

### Upload New Jobs

1. Click "Upload" tab
2. Select "Job Descriptions"
3. Choose your JSON or CSV file
4. Click "Upload"

### Upload New Candidates

1. Click "Upload" tab
2. Select "Candidate Profiles"
3. Choose your JSON or CSV file
4. Click "Upload"

### Get Rankings

1. Go to "Jobs" tab
2. Click "View Matches" on desired job
3. See candidates ranked by match score
4. Click any candidate for detailed analysis

---

## ⚙️ Configuration

Edit `.env` file:

```
PYTHONUNBUFFERED=1
DATABASE_URL=sqlite:///./candidate_matcher.db
REACT_APP_API_URL=http://localhost:8000
```

---

## 🐛 Troubleshooting

**Port already in use?**

```bash
# Docker
docker-compose down
docker-compose up

# Local
# Find process: lsof -i :8000
# Kill it: kill -9 [PID]
```

**Models not downloading?**

- First run takes 2-3 minutes (downloads ML models)
- Check internet connection
- Docker logs: `docker logs candidate-matcher-backend`

**Can't upload files?**

- Ensure file is JSON or CSV
- Check file formatting
- See API_EXAMPLES.md for format details

---

## 📈 Next Steps

1. ✅ Try with sample data
2. ✅ Upload your own candidates and jobs
3. ✅ Explore API with curl or Postman
4. ✅ Integrate into your systems
5. ✅ Deploy to cloud (see DEPLOYMENT.md)

---

## 🚀 Deploy to Cloud

```bash
# AWS
docker build -t candidate-matcher .
aws ecr create-repository --repository-name candidate-matcher

# Google Cloud
gcloud run deploy candidate-matcher --source .

# Heroku
heroku create candidate-matcher
git push heroku main
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 💡 Tips

- Use `/docs` endpoint for interactive API documentation
- Match results are cached for performance
- Batch upload 1000+ records for best performance
- Pre-compute embeddings for large datasets

---

**Questions?** Check the [README.md](README.md) for detailed documentation.

**Ready to scale?** See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup.

**Want more examples?** Check [API_EXAMPLES.md](API_EXAMPLES.md) for complete API reference.
