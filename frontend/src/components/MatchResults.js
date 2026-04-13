import React, { useState } from 'react';

function MatchResults({ jobId, matches, loading }) {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleViewDetails = async (candidateId) => {
    if (selectedCandidate === candidateId && candidateDetails) {
      setSelectedCandidate(null);
      setCandidateDetails(null);
      return;
    }

    setLoadingDetails(true);
    setSelectedCandidate(candidateId);
    
    try {
      const response = await fetch(`/match/${jobId}/${candidateId}`);
      const data = await response.json();
      setCandidateDetails(data);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="content-section">
        <p>Loading matches...</p>
      </div>
    );
  }

  return (
    <div className="content-section">
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>{matches?.job_title}</h2>
        <p style={{ margin: '0', color: '#666' }}>
          Found {matches?.results?.length || 0} matching candidates
        </p>
      </div>

      <div className="list-container">
        {!matches?.results || matches.results.length === 0 ? (
          <p>No matches found.</p>
        ) : (
          matches.results.map((match, index) => (
            <div key={match.candidate_id}>
              <div 
                className="match-card"
                onClick={() => handleViewDetails(match.candidate_id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="match-header">
                  <span className="match-rank">#{match.rank}</span>
                  <div className="match-info">
                    <h3>{match.candidate_name}</h3>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      {match.explanation_summary}
                    </p>
                  </div>
                  <div className="match-score">{match.overall_score}%</div>
                </div>

                <div className="score-breakdown">
                  <div className="score-item">
                    <div className="score-item-label">Skill Match</div>
                    <div className="score-item-value">{match.skill_score}</div>
                  </div>
                  <div className="score-item">
                    <div className="score-item-label">Experience</div>
                    <div className="score-item-value">{match.experience_score}</div>
                  </div>
                  <div className="score-item">
                    <div className="score-item-label">Keywords</div>
                    <div className="score-item-value">{match.keyword_score}</div>
                  </div>
                  <div className="score-item">
                    <div className="score-item-label">Semantic</div>
                    <div className="score-item-value">{match.semantic_score}</div>
                  </div>
                </div>
              </div>

              {selectedCandidate === match.candidate_id && candidateDetails && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
                  <h4>📋 Detailed Matching Analysis</h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '15px' }}>
                    {/* Candidate Profile */}
                    <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
                      <h5>👤 Candidate Profile</h5>
                      <p><strong>Name:</strong> {candidateDetails.candidate_name}</p>
                      <p><strong>Experience:</strong> {candidateDetails.candidate_profile?.experience_years} years</p>
                      {candidateDetails.candidate_profile?.location && (
                        <p><strong>Location:</strong> {candidateDetails.candidate_profile.location}</p>
                      )}
                      <div style={{ marginTop: '10px' }}>
                        <p style={{ margin: '5px 0', fontSize: '0.9em' }}><strong>Skills:</strong></p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {candidateDetails.candidate_profile?.skills?.slice(0, 5).map((skill, i) => (
                            <span key={i} className="tag">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Job Requirements */}
                    <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
                      <h5>💼 Job Requirements</h5>
                      <p><strong>Title:</strong> {candidateDetails.job_requirements?.title}</p>
                      <p><strong>Required Experience:</strong> {candidateDetails.job_requirements?.years_required} years</p>
                      {candidateDetails.job_requirements?.company && (
                        <p><strong>Company:</strong> {candidateDetails.job_requirements.company}</p>
                      )}
                      <div style={{ marginTop: '10px' }}>
                        <p style={{ margin: '5px 0', fontSize: '0.9em' }}><strong>Required Skills:</strong></p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {candidateDetails.job_requirements?.required_skills?.slice(0, 5).map((skill, i) => (
                            <span key={i} className="tag required">{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Skill Match */}
                    <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
                      <h5>🎯 Skill Match</h5>
                      <p>
                        <strong>Required:</strong> {candidateDetails.detailed_explanation?.skill_match?.required}
                      </p>
                      <p>
                        <strong>Optional:</strong> {candidateDetails.detailed_explanation?.skill_match?.optional}
                      </p>
                      <p style={{ marginTop: '10px' }}>
                        <strong>Score:</strong>{' '}
                        <span style={{ fontSize: '1.3em', color: '#667eea' }}>
                          {candidateDetails.detailed_explanation?.skill_match?.score}
                        </span>
                      </p>
                    </div>

                    {/* Experience */}
                    <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
                      <h5>📚 Experience Alignment</h5>
                      <p>
                        <strong>Candidate:</strong> {candidateDetails.detailed_explanation?.experience?.candidate_years} years
                      </p>
                      <p>
                        <strong>Required:</strong> {candidateDetails.detailed_explanation?.experience?.required_years} years
                      </p>
                      <p style={{ marginTop: '10px' }}>
                        <strong>Score:</strong>{' '}
                        <span style={{ fontSize: '1.3em', color: '#667eea' }}>
                          {candidateDetails.detailed_explanation?.experience?.score}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MatchResults;
