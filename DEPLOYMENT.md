# Deployment Guide

## Local Development Setup

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn app.main:app --reload

# Server will be available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Frontend will be available at http://localhost:3000
```

---

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# From project root
docker-compose up

# Access the application:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs

# To rebuild after code changes:
docker-compose up --build

# To stop:
docker-compose down

# To clean up volumes:
docker-compose down -v
```

### Building Individual Containers

#### Backend Only

```bash
docker build -t candidate-matcher-backend .
docker run -p 8000:8000 candidate-matcher-backend
```

#### Frontend Only

```bash
docker build -f frontend.Dockerfile -t candidate-matcher-frontend .
docker run -p 3000:3000 candidate-matcher-frontend
```

---

## Cloud Deployment

### AWS ECS

```bash
# Build and push to ECR
aws ecr create-repository --repository-name candidate-matcher
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [ACCOUNT].dkr.ecr.us-east-1.amazonaws.com

docker tag candidate-matcher-backend [ACCOUNT].dkr.ecr.us-east-1.amazonaws.com/candidate-matcher:latest
docker push [ACCOUNT].dkr.ecr.us-east-1.amazonaws.com/candidate-matcher:latest

# Create ECS service with task definition
# (See AWS documentation for detailed steps)
```

### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/[PROJECT]/candidate-matcher

# Deploy to Cloud Run
gcloud run deploy candidate-matcher \
  --image gcr.io/[PROJECT]/candidate-matcher \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Heroku

```bash
# Create app
heroku create candidate-matcher-app

# Push to Heroku
git push heroku main

# View logs
heroku logs --tail
```

---

## Production Checklist

- [ ] Environment variables configured (.env file)
- [ ] Database migrated (if using PostgreSQL)
- [ ] CORS settings restricted to known domains
- [ ] API rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring and alerts set up
- [ ] Backup strategy implemented
- [ ] SSL/TLS certificates installed
- [ ] Password/API keys secured in environment
- [ ] Error pages customized

---

## Performance Tuning

### Caching Strategy

```python
# Add Redis for caching match results
pip install redis

# In main.py:
from redis import Redis
cache = Redis(host='redis', port=6379, db=0)

# Cache match results for 1 hour
cache.setex(f"match:{job_id}", 3600, results_json)
```

### Database Optimization

```sql
-- Add indexes for faster queries
CREATE INDEX idx_candidate_skills ON candidate_skills(skill);
CREATE INDEX idx_job_required_skills ON job_descriptions USING GIN(required_skills);

-- Use connection pooling
-- sqlalchemy pool_size = 20, max_overflow = 40
```

### Load Balancing

```nginx
# Nginx configuration for load balancing
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

server {
    listen 80;
    location /api/ {
        proxy_pass http://backend;
    }
}
```

---

## Monitoring

### Health Checks

The application includes health check endpoints:

```bash
# Check if application is running
curl http://localhost:8000/health

# Get system statistics
curl http://localhost:8000/stats
```

### Logging

Configure logging in production:

```python
# Structured logging
import logging
from python_json_logger import json_log

handler = logging.StreamHandler()
formatter = json_log.JsonFormatter()
handler.setFormatter(formatter)
logger.addHandler(handler)
```

### Metrics

Monitor these key metrics:

- Request latency (target: <2s for matching)
- Error rate (target: <0.1%)
- Cache hit rate (target: >80%)
- Database query time (target: <100ms)
- Embedding computation time (target: <500ms)

---

## Troubleshooting Deployment

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 [PID]
```

### Docker Network Issues

```bash
# Check if containers can communicate
docker exec candidate-matcher-backend ping candidate-matcher-frontend

# View logs
docker logs candidate-matcher-backend
docker logs candidate-matcher-frontend
```

### Database Connection Issues

```bash
# Check database is accessible
python -c "from app.database import Database; db = Database(); print('OK')"
```

---

## Scaling Guide

### Stage 1: Optimize Single Server (10k-100k candidates)

```bash
# Increase worker processes
gunicorn --workers 4 --threads 2 app.main:app

# Enable caching
docker-compose -f docker-compose.yml -f docker-compose.redis.yml up
```

### Stage 2: Horizontal Scaling (100k-1M candidates)

```yaml
# docker-compose scale configuration
version: "3.8"
services:
  backend:
    deploy:
      replicas: 3 # Scale to 3 instances

  redis:
    image: redis:latest
    deploy:
      replicas: 1
```

### Stage 3: Distributed System (1M+ candidates)

```bash
# Use Kubernetes
kubectl apply -f k8s/deployment.yaml
kubectl autoscale deployment candidate-matcher-backend --min=3 --max=10
```

---

## Backup & Recovery

### Database Backup

```bash
# SQLite backup
cp candidate_matcher.db candidate_matcher.db.backup

# PostgreSQL backup
pg_dump -U postgres candidate_matcher > backup.sql
```

### Restore from Backup

```bash
# SQLite restore
cp candidate_matcher.db.backup candidate_matcher.db

# PostgreSQL restore
psql -U postgres < backup.sql
```

---

## Security

### HTTPS/SSL

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
}
```

### API Authentication (Optional)

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.get("/secure-endpoint")
async def secure_endpoint(credentials = Depends(security)):
    return {"message": "Secure endpoint"}
```

### Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()

@app.get("/match/{job_id}")
@limiter.limit("100/minute")
async def get_matches(request: Request, job_id: str):
    # ...
```

---

## Cost Optimization

- Use spot instances for non-critical workloads
- Enable auto-scaling based on metrics
- Use CDN for frontend assets
- Implement caching to reduce database queries
- Archive old match results to cold storage
