import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, fileUrl } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Timeline from '../components/Timeline.jsx';
import { StatusBadge, PriorityBadge, Spinner, Alert, categoryIcon, formatDateTime } from '../components/ui.jsx';

export default function ComplaintDetails() {
  const { code } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get(`/complaints/${code}`, token);
        if (alive) setData(res);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [code, token]);

  if (loading) return <div className="container"><Spinner label="Loading complaint…" /></div>;
  if (error) return <div className="container"><Alert>{error}</Alert><Link to="/dashboard" className="btn btn-outline">← Back</Link></div>;

  const { complaint: c, events } = data;

  return (
    <div className="container">
      <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back to dashboard</Link>

      <div className="detail-grid">
        <div className="card detail-main">
          <div className="detail-head">
            <span className="complaint-cat">{categoryIcon(c.category)} {c.category}</span>
            <div className="badge-row">
              <StatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
            </div>
          </div>
          <h1>{c.title}</h1>
          <p className="complaint-code big">{c.code}</p>
          <p className="detail-desc">{c.description}</p>

          {c.image_path && (
            <div className="detail-image">
              <img src={fileUrl(c.image_path)} alt="Complaint attachment" />
            </div>
          )}

          {(c.resolution_remarks || c.resolution_evidence_path) && (
            <div className="resolution-box">
              <h3>✅ Resolution</h3>
              {c.resolution_remarks && <p>{c.resolution_remarks}</p>}
              {c.resolution_evidence_path && (
                <a href={fileUrl(c.resolution_evidence_path)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  📎 View resolution evidence
                </a>
              )}
            </div>
          )}
        </div>

        <div className="detail-side">
          <div className="card">
            <h3 className="card-title">Details</h3>
            <dl className="info-list">
              <div><dt>Location</dt><dd>📍 {c.location}</dd></div>
              <div><dt>Department</dt><dd>{c.department || 'Not assigned yet'}</dd></div>
              <div><dt>Officer</dt><dd>{c.officer || '—'}</dd></div>
              <div><dt>Submitted</dt><dd>{formatDateTime(c.created_at)}</dd></div>
              <div><dt>Last update</dt><dd>{formatDateTime(c.updated_at)}</dd></div>
            </dl>
          </div>

          <div className="card">
            <h3 className="card-title">Status timeline</h3>
            <Timeline events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
