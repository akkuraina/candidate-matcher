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
                <div style={{ backgroundColor: '#1a1a2e', padding: '20px', borderRadius: '5px', marginBottom: '20px', border: '1px solid rgba(0, 191, 255, 0.2)' }}>
                  <h4 style={{ color: '#00bfff' }}>📋 Detailed Matching Analysis</h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                    {/* Candidate Profile */}
                    <div style={{ backgroundColor: '#16213e', padding: '15px', borderRadius: '5px', border: '1px solid rgba(0, 191, 255, 0.2)' }}>
                      <h5 style={{ color: '#00bfff' }}>👤 Candidate Profile</h5>
                      <p style={{ color: '#b0b9c8' }}><strong>Name:</strong> {candidateDetails.candidate_name}</p>
                      <p style={{ color: '#b0b9c8' }}><strong>Experience:</strong> {candidateDetails.candidate_profile?.experience_years} years</p>
                      {candidateDetails.candidate_profile?.location && (
                        <p style={{ color: '#b0b9c8' }}><strong>Location:</strong> {candidateDetails.candidate_profile.location}</p>
                      )}
                      <div style={{ marginTop: '10px' }}>
                        <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#00bfff' }}><strong>Skills:</strong></p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {candidateDetails.candidate_profile?.skills?.slice(0, 5).map((skill, i) => (
                            <span key={i} className="tag">{skill}</span>
                          ))}
                          {candidateDetails.candidate_profile?.skills?.length > 5 && (
                            <span style={{ fontSize: '0.9em', color: '#666' }}>+{candidateDetails.candidate_profile.skills.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Experience Matched */}
                    <div style={{ backgroundColor: '#16213e', padding: '15px', borderRadius: '5px', border: '1px solid rgba(0, 191, 255, 0.2)' }}>
                      <h5 style={{ color: '#00bfff' }}>📚 Experience Matched</h5>
                      <p style={{ color: '#b0b9c8' }}>
                        <strong>Candidate Experience:</strong> {candidateDetails.detailed_explanation?.experience?.candidate_years} years
                      </p>
                      <p style={{ color: '#b0b9c8' }}>
                        <strong>Required Experience:</strong> {candidateDetails.detailed_explanation?.experience?.required_years} years
                      </p>
                      <p style={{ marginTop: '10px' }}>
                        <strong style={{ color: '#00bfff' }}>Score:</strong>{' '}
                        <span style={{ fontSize: '1.3em', color: '#00ff88', fontWeight: 'bold' }}>
                          {candidateDetails.detailed_explanation?.experience?.score}%
                        </span>
                      </p>
                    </div>

                    {/* Skills Matched */}
                    <div style={{ backgroundColor: '#16213e', padding: '15px', borderRadius: '5px', border: '1px solid rgba(0, 191, 255, 0.2)' }}>
                      <h5 style={{ color: '#00bfff' }}>🎯 Skills Matched</h5>
                      <p style={{ color: '#b0b9c8' }}>
                        <strong>Required Skills:</strong> {candidateDetails.detailed_explanation?.skill_match?.required}
                      </p>
                      <p style={{ color: '#b0b9c8' }}>
                        <strong>Optional Skills:</strong> {candidateDetails.detailed_explanation?.skill_match?.optional}
                      </p>
                      <p style={{ marginTop: '10px' }}>
                        <strong style={{ color: '#00bfff' }}>Score:</strong>{' '}
                        <span style={{ fontSize: '1.3em', color: '#00ff88', fontWeight: 'bold' }}>
                          {candidateDetails.detailed_explanation?.skill_match?.score}%
                        </span>
                      </p>
                    </div>

                    {/* Lacking Skills */}
                    <div style={{ backgroundColor: '#16213e', padding: '15px', borderRadius: '5px', border: '1px solid rgba(0, 191, 255, 0.2)' }}>
                      <h5 style={{ color: '#00bfff' }}>⚠️ Lacking Skills</h5>
                      {(candidateDetails.detailed_explanation?.missing_skills?.required?.length > 0 || 
                        candidateDetails.detailed_explanation?.missing_skills?.optional?.length > 0) ? (
                        <>
                          {candidateDetails.detailed_explanation?.missing_skills?.required?.length > 0 && (
                            <div style={{ marginBottom: '10px' }}>
                              <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#ff6b6b' }}><strong>Missing Required:</strong></p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {candidateDetails.detailed_explanation.missing_skills.required.map((skill, i) => (
                                  <span key={i} className="tag" style={{ backgroundColor: 'rgba(255, 107, 107, 0.15)', color: '#ff6b6b', border: '1px solid rgba(255, 107, 107, 0.3)' }}>{skill}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {candidateDetails.detailed_explanation?.missing_skills?.optional?.length > 0 && (
                            <div>
                              <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#ffcc00' }}><strong>Missing Optional:</strong></p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {candidateDetails.detailed_explanation.missing_skills.optional.slice(0, 5).map((skill, i) => (
                                  <span key={i} className="tag" style={{ backgroundColor: 'rgba(255, 204, 0, 0.15)', color: '#ffcc00', border: '1px solid rgba(255, 204, 0, 0.3)' }}>{skill}</span>
                                ))}
                                {candidateDetails.detailed_explanation.missing_skills.optional.length > 5 && (
                                  <span style={{ fontSize: '0.9em', color: '#999' }}>+{candidateDetails.detailed_explanation.missing_skills.optional.length - 5} more</span>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <p style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ All required skills matched!</p>
                      )}
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
