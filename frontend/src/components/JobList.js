import React, { useState, useEffect } from 'react';

function JobList({ onSelectJob }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/jobs');
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="content-section">
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="content-section">
      <h2>Job Descriptions</h2>
      <div className="list-container">
        {jobs.length === 0 ? (
          <p>No jobs available. Upload some job descriptions first.</p>
        ) : (
          jobs.map((job) => (
            <div 
              key={job.id} 
              className="card"
              onClick={() => onSelectJob(job.id)}
            >
              <h3>{job.title}</h3>
              {job.company && <p><strong>Company:</strong> {job.company}</p>}
              {job.location && <p><strong>Location:</strong> {job.location}</p>}
              <p>{job.description.substring(0, 200)}...</p>
              <div className="card-tags">
                {job.required_skills && job.required_skills.slice(0, 3).map((skill, i) => (
                  <span key={i} className="tag required">{skill}</span>
                ))}
                {job.required_skills && job.required_skills.length > 3 && (
                  <span className="tag">+{job.required_skills.length - 3} more</span>
                )}
              </div>
              <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#999' }}>
                {job.years_required}+ years • {job.experience_level || 'Not specified'}
              </p>
              <button className="main-btn" style={{ marginTop: '10px', width: '100%' }}>
                View Matches
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default JobList;
