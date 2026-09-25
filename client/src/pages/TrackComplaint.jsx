import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import Timeline from '../components/Timeline.jsx';
import { StatusBadge, PriorityBadge, Spinner, Alert, categoryIcon, formatDateTime } from '../components/ui.jsx';

export default function TrackComplaint() {
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get('code') || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!code.trim()) return;
    setLoading(true);
    try {
      const data = await api.get(`/complaints/track/${code.trim()}`);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container narrow">
      <div className="track-hero">
        <h1>Track a complaint</h1>
        <p className="muted">Enter your complaint ID to see its current status — no login required.</p>
        <form onSubmit={handleSubmit} className="track-form">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. GRV-2026-00001"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Spinner /> : 'Track'}
          </button>
        </form>
        <Alert>{error}</Alert>
      </div>

      {result && (
        <div className="card track-result">
          <div className="detail-head">
            <span className="complaint-cat">{categoryIcon(result.complaint.category)} {result.complaint.category}</span>
            <div className="badge-row">
              <StatusBadge status={result.complaint.status} />
              <PriorityBadge priority={result.complaint.priority} />
            </div>
          </div>
          <h2>{result.complaint.title}</h2>
          <p className="complaint-code big">{result.complaint.code}</p>
          <dl className="info-list inline">
            <div><dt>Location</dt><dd>📍 {result.complaint.location}</dd></div>
            <div><dt>Department</dt><dd>{result.complaint.department || 'Not assigned yet'}</dd></div>
            <div><dt>Reported by</dt><dd>{result.complaint.citizen_name}</dd></div>
            <div><dt>Submitted</dt><dd>{formatDateTime(result.complaint.created_at)}</dd></div>
          </dl>

          {result.complaint.resolution_remarks && (
            <div className="resolution-box">
              <h3>✅ Resolution</h3>
              <p>{result.complaint.resolution_remarks}</p>
            </div>
          )}

          <h3 className="card-title">Status timeline</h3>
          <Timeline events={result.events} />
        </div>
      )}
    </div>
  );
}
