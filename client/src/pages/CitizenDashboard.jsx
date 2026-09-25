import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ComplaintCard from '../components/ComplaintCard.jsx';
import { Spinner, EmptyState, Alert } from '../components/ui.jsx';

export default function CitizenDashboard() {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api.get('/complaints/mine', token);
        if (alive) setComplaints(data.complaints);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token]);

  const counts = complaints.reduce(
    (acc, c) => {
      acc.total++;
      if (c.status === 'Resolved') acc.resolved++;
      else acc.open++;
      return acc;
    },
    { total: 0, open: 0, resolved: 0 }
  );

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="muted">Here are the grievances you've reported.</p>
        </div>
        <Link to="/complaints/new" className="btn btn-primary">+ New Complaint</Link>
      </div>

      <div className="mini-stats">
        <div className="mini-stat"><strong>{counts.total}</strong><span>Total reported</span></div>
        <div className="mini-stat"><strong>{counts.open}</strong><span>In progress</span></div>
        <div className="mini-stat"><strong>{counts.resolved}</strong><span>Resolved</span></div>
      </div>

      <Alert>{error}</Alert>

      {loading ? (
        <Spinner label="Loading your complaints…" />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No complaints yet"
          message="When you report an issue it will show up here so you can track its progress."
          action={<Link to="/complaints/new" className="btn btn-primary">Report your first grievance</Link>}
        />
      ) : (
        <div className="complaint-list">
          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} to={`/complaints/${c.code}`} />
          ))}
        </div>
      )}
    </div>
  );
}
