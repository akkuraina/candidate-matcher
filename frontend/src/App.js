import React, { useState, useEffect } from 'react';
import './App.css';
import JobList from './components/JobList';
import CandidateList from './components/CandidateList';
import MatchResults from './components/MatchResults';
import Upload from './components/Upload';
import Navigation from './components/Navigation';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleJobSelect = (jobId) => {
    setSelectedJob(jobId);
    setActiveTab('matches');
    fetchMatches(jobId);
  };

  const fetchMatches = async (jobId) => {
    setLoading(true);
    try {
      const response = await fetch(`/match/${jobId}`);
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpload = () => {
    fetchStats();
  };

  return (
    <div className="app">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="container">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="stats-section">
              <h1>Candidate-Job Matcher</h1>
              {stats && (
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>Total Jobs</h3>
                    <p className="stat-value">{stats.total_jobs}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Candidates</h3>
                    <p className="stat-value">{stats.total_candidates}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="quick-stats">
              <h2>Get Started</h2>
              <p>Upload job descriptions and candidate profiles to start matching.</p>
              <div className="button-group">
                <button className="main-btn" onClick={() => setActiveTab('upload')}>
                  Upload Data
                </button>
                <button className="secondary-btn" onClick={() => setActiveTab('jobs')}>
                  Browse Jobs
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <Upload onUploadSuccess={handleDataUpload} />
        )}

        {activeTab === 'jobs' && (
          <JobList onSelectJob={handleJobSelect} />
        )}

        {activeTab === 'candidates' && (
          <CandidateList />
        )}

        {activeTab === 'matches' && selectedJob && (
          <MatchResults 
            jobId={selectedJob} 
            matches={matches} 
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

export default App;
