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

  if (loading) {
    return (
      <div className="content-section">
        <p>Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="content-section">
      <h2>Candidates</h2>
      <div className="list-container">
        {candidates.length === 0 ? (
          <p>No candidates available. Upload some candidate profiles first.</p>
        ) : (
          candidates.map((candidate) => (
            <div key={candidate.id} className="card">
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
