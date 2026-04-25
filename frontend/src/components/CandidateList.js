import React, { useState, useEffect } from 'react';

function CandidateList() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/candidates');
      const data = await response.json();
      setCandidates(data.candidates || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (e, candidateId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        const response = await fetch(`/candidates/${candidateId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setCandidates(candidates.filter(c => c.id !== candidateId));
        } else {
          alert('Failed to delete candidate');
        }
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Error deleting candidate');
      }
    }
  };

  const handleDeleteAllCandidates = async () => {
    if (window.confirm('Are you sure you want to delete ALL candidates? This action cannot be undone.')) {
      try {
        const response = await fetch('/candidates', {
          method: 'DELETE'
        });
        if (response.ok) {
          setCandidates([]);
        } else {
          alert('Failed to delete all candidates');
        }
      } catch (error) {
        console.error('Error deleting all candidates:', error);
        alert('Error deleting all candidates');
      }
    }
  };

  if (loading) {
    return (
      <div className="content-section">
        <p>Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="content-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Candidates</h2>
        {candidates.length > 0 && (
          <button 
            className="delete-btn" 
            onClick={handleDeleteAllCandidates}
            style={{ padding: '8px 12px', fontSize: '0.9em' }}
          >
            Delete All
          </button>
        )}
      </div>
      <div className="list-container">
        {candidates.length === 0 ? (
          <p>No candidates available. Upload some candidate profiles first.</p>
        ) : (
          candidates.map((candidate) => (
            <div key={candidate.id} className="card" style={{ position: 'relative' }}>
              <button
                className="delete-btn"
                onClick={(e) => handleDeleteCandidate(e, candidate.id)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '4px 8px',
                  fontSize: '0.8em',
                  zIndex: 10
                }}
                title="Delete this candidate"
              >
                ✕
              </button>
              <h3>{candidate.name}</h3>
              {candidate.email && <p><strong>Email:</strong> {candidate.email}</p>}
              <p>{candidate.summary.substring(0, 200)}...</p>
              <div className="card-tags">
                {candidate.skills && candidate.skills.slice(0, 3).map((skill, i) => (
                  <span key={i} className="tag">{skill}</span>
                ))}
                {candidate.skills && candidate.skills.length > 3 && (
                  <span className="tag">+{candidate.skills.length - 3} more</span>
                )}
              </div>
              <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#999' }}>
                {candidate.experience_years}+ years experience
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CandidateList;

