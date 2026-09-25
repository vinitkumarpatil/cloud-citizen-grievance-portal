import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatCard, StatusBadge, PriorityBadge, Spinner, EmptyState, Alert, categoryIcon, formatDate } from '../components/ui.jsx';

const STATUSES = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function AdminDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', q: '' });

  useEffect(() => {
    api.get('/complaints/meta/categories').then((d) => setCategories(d.categories || [])).catch(() => {});
  }, []);

  const loadStats = useCallback(() => {
    api.get('/admin/stats', token).then(setStats).catch((e) => setError(e.message));
  }, [token]);

  const loadComplaints = useCallback(() => {
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && qs.append(k, v));
    setLoading(true);
    api.get(`/admin/complaints?${qs.toString()}`, token)
      .then((d) => setComplaints(d.complaints))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, filters]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadComplaints(); }, [loadComplaints]);

  const setFilter = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const clearFilters = () => setFilters({ status: '', category: '', priority: '', q: '' });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>Authority Dashboard</h1>
          <p className="muted">Monitor, prioritise and resolve citizen grievances.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { loadStats(); loadComplaints(); }}>↻ Refresh</button>
      </div>

      <Alert>{error}</Alert>

      <div className="stat-grid">
        <StatCard label="Total complaints" value={stats?.total ?? '—'} tone="blue" icon="📋" />
        <StatCard label="Pending" value={stats?.submitted ?? '—'} tone="slate" icon="🕓" />
        <StatCard label="In progress" value={stats?.inProgress ?? '—'} tone="indigo" icon="🔧" />
        <StatCard label="Resolved" value={stats?.resolved ?? '—'} tone="green" icon="✅" />
        <StatCard label="High priority open" value={stats?.highPriority ?? '—'} tone="red" icon="⚠️" />
      </div>

      {stats?.byCategory?.length > 0 && (
        <div className="card">
          <h3 className="card-title">Complaints by category</h3>
          <div className="bar-chart">
            {stats.byCategory.map((row) => {
              const max = Math.max(...stats.byCategory.map((r) => r.n));
              return (
                <div className="bar-row" key={row.category}>
                  <span className="bar-label">{categoryIcon(row.category)} {row.category}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(row.n / max) * 100}%` }} />
                  </div>
                  <span className="bar-value">{row.n}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div className="filter-bar">
          <input className="filter-search" placeholder="🔍 Search title, description or ID…"
            value={filters.q} onChange={setFilter('q')} />
          <select value={filters.status} onChange={setFilter('status')}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.category} onChange={setFilter('category')}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.priority} onChange={setFilter('priority')}>
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {hasFilters && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear</button>}
        </div>

        {loading ? (
          <Spinner label="Loading complaints…" />
        ) : complaints.length === 0 ? (
          <EmptyState icon="🔍" title="No complaints match" message="Try adjusting or clearing the filters." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Complaint</th><th>Location</th><th>Priority</th><th>Status</th><th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} onClick={() => navigate(`/admin/complaints/${c.code}`)} className="clickable-row">
                    <td className="mono">{c.code}</td>
                    <td>
                      <div className="cell-title">{c.title}</div>
                      <div className="muted small">{categoryIcon(c.category)} {c.category} · {c.citizen_name}</div>
                    </td>
                    <td className="muted">{c.location}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="muted small">{formatDate(c.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && complaints.length > 0 && (
          <p className="muted small table-count">{complaints.length} complaint(s)</p>
        )}
      </div>
    </div>
  );
}
