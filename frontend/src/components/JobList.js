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

  const handleDeleteJob = async (e, jobId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const response = await fetch(`/jobs/${jobId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setJobs(jobs.filter(job => job.id !== jobId));
        } else {
          alert('Failed to delete job');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Error deleting job');
      }
    }
  };

  const handleDeleteAllJobs = async () => {
    if (window.confirm('Are you sure you want to delete ALL jobs? This action cannot be undone.')) {
      try {
        const response = await fetch('/jobs', {
          method: 'DELETE'
        });
        if (response.ok) {
          setJobs([]);
        } else {
          alert('Failed to delete all jobs');
        }
      } catch (error) {
        console.error('Error deleting all jobs:', error);
        alert('Error deleting all jobs');
      }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Job Descriptions</h2>
        {jobs.length > 0 && (
          <button 
            className="delete-btn" 
            onClick={handleDeleteAllJobs}
            style={{ padding: '8px 12px', fontSize: '0.9em' }}
          >
            Delete All
          </button>
        )}
      </div>
      <div className="list-container">
        {jobs.length === 0 ? (
          <p>No jobs available. Upload some job descriptions first.</p>
        ) : (
          jobs.map((job) => (
            <div 
              key={job.id} 
              className="card"
              onClick={() => onSelectJob(job.id)}
              style={{ position: 'relative' }}
            >
              <button
                className="delete-btn"
                onClick={(e) => handleDeleteJob(e, job.id)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '4px 8px',
                  fontSize: '0.8em',
                  zIndex: 10
                }}
                title="Delete this job"
              >
                ✕
              </button>
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

