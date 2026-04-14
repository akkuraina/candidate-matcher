import React from 'react';
import '../App.css';

function Navigation({ activeTab, setActiveTab }) {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>🎯 Candidate Matcher</h2>
        </div>
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload
          </button>
          <button 
            className={`nav-tab ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs
          </button>
          <button 
            className={`nav-tab ${activeTab === 'candidates' ? 'active' : ''}`}
            onClick={() => setActiveTab('candidates')}
          >
            Candidates
          </button>
          {activeTab === 'matches' && (
            <span className="nav-tab active">Matches</span>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
