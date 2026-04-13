import React, { useState } from 'react';

function Upload({ onUploadSuccess }) {
  const [uploadType, setUploadType] = useState('jobs');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      setMessageType('error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = uploadType === 'jobs' ? '/jobs/upload' : '/candidates/upload';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✓ ${data.message}`);
        setMessageType('success');
        setFile(null);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        setMessage(`Error: ${data.detail}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Error uploading file: ${error.message}`);
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="content-section">
      <h2>Upload Data</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Upload Type:
        </label>
        <select 
          value={uploadType} 
          onChange={(e) => setUploadType(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '1em',
          }}
        >
          <option value="jobs">Job Descriptions</option>
          <option value="candidates">Candidate Profiles</option>
        </select>
      </div>

      <div className="upload-box">
        <h3>📁 Choose a File</h3>
        <p><strong>Upload Any File Type</strong> - JSON, CSV, Excel, Word, or even plain text. The system extracts meaningful data intelligently.</p>
        
        <input
          type="file"
          id="file-input"
          className="upload-input"
          onChange={handleFileChange}
          accept=".json,.csv,.xlsx,.docx,.txt"
        />
        
        <label htmlFor="file-input" className="upload-btn">
          Select File
        </label>

        {file && (
          <p style={{ marginTop: '15px', color: '#333' }}>
            Selected: <strong>{file.name}</strong>
          </p>
        )}

        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{ marginTop: '15px', cursor: uploading ? 'not-allowed' : 'pointer' }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {message && (
        <div className={`upload-status ${messageType}`}>
          {message}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h3>📋 Format Examples (Field Names Don't Matter - They're Auto-Mapped!)</h3>
        
        <p style={{ color: '#555', marginBottom: '15px', fontStyle: 'italic' }}>
          ✨ <strong>Pro Tip:</strong> Field names like "title", "job_title", "position", or "role" all work. The system automatically maps them to the correct fields.
        </p>

        <h4>JSON Format (Structured):</h4>
        <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '3px', overflow: 'auto', fontSize: '0.85em' }}>
{`[
  {
    "title": "Senior Backend Engineer",
    "description": "Requirements and details here...",
    "required_skills": "Python; FastAPI; Docker",
    "optional_skills": "Kubernetes, GraphQL, Redis",
    "years_required": 5
  }
]`}
        </pre>

        <h4>CSV Format (Any Column Names):</h4>
        <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '3px', overflow: 'auto', fontSize: '0.85em' }}>
{`position,description,must_have,nice_to_have,experience
Senior Backend Engineer,Requirements...,Python;FastAPI;Docker,Kubernetes,5`}
        </pre>

        <h4>Excel Format (.xlsx) - Two Styles:</h4>
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
          <strong>Style 1: Structured Table</strong> - Headers in first row, data below (works like CSV):
        </p>
        <table style={{ borderCollapse: 'collapse', marginTop: '10px', marginBottom: '20px', border: '1px solid #ddd', width: '100%', fontSize: '0.85em' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>title</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>description</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>skills</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>Senior Backend Engineer</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>We're looking for...</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>Python; FastAPI; Docker</td>
            </tr>
          </tbody>
        </table>

        <p style={{ fontSize: '0.9em', color: '#666' }}>
          <strong>Style 2: Free-form Data</strong> - No table structure? No problem! The system extracts all text and creates entries:
        </p>
        <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '3px', overflow: 'auto', fontSize: '0.85em' }}>
{`Cell A1: Senior Backend Engineer
Cell A2: Looking for an experienced engineer...
Cell B1: Required: Python, FastAPI, Docker
...`}
        </pre>

        <h4>Word Format (.docx) - Two Styles:</h4>
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
          <strong>Style 1: Tables</strong> - The system extracts data from tables in your document:
        </p>
        <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '3px', overflow: 'auto', fontSize: '0.85em' }}>
{`(Word document with table)
| Title                    | Description           | Skills         |
| Senior Backend Engineer  | Requirements...       | Python; Docker  |
`}
        </pre>

        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
          <strong>Style 2: Narrative Text</strong> - Job descriptions as regular paragraphs work too:
        </p>
        <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '3px', overflow: 'auto', fontSize: '0.85em' }}>
{`Senior Backend Engineer

We are looking for a talented software engineer to join our team.
You will work with Python, FastAPI, and Docker...`}
        </pre>

        <h4>Plain Text Format (.txt):</h4>
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
          Just paste a job description or candidate profile as plain text:
        </p>
        <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '3px', overflow: 'auto', fontSize: '0.85em' }}>
{`Senior Backend Engineer - 5 years experience

We're looking for an experienced backend engineer...
Required: Python, FastAPI, Docker
Optional: Kubernetes, Redis`}
        </pre>

        <h4>Skill Separators:</h4>
        <p style={{ fontSize: '0.9em', color: '#666' }}>
          Skills can be separated using: <code>;</code> (semicolon), <code>,</code> (comma), or <code>|</code> (pipe)
        </p>
        <p style={{ fontSize: '0.9em', color: '#666' }}>
          Examples: "Python; FastAPI; Docker" or "Python, FastAPI, Docker" or "Python | FastAPI | Docker"
        </p>
      </div>
    </div>
  );
}

export default Upload;
