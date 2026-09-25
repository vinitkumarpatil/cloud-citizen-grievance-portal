// Small shared UI primitives used across the app.

const STATUS_SLUG = {
  Submitted: 'submitted',
  Assigned: 'assigned',
  'In Progress': 'progress',
  Resolved: 'resolved',
};

export function StatusBadge({ status }) {
  const slug = STATUS_SLUG[status] || 'submitted';
  return <span className={`badge status-${slug}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  const slug = (priority || 'Medium').toLowerCase();
  return <span className={`badge prio-${slug}`}>{priority} priority</span>;
}

export function StatCard({ label, value, tone = 'default', icon }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export function Spinner({ label }) {
  return (
    <div className="spinner-wrap">
      <span className="spinner" />
      {label && <span className="muted">{label}</span>}
    </div>
  );
}

export function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p className="muted">{message}</p>}
      {action}
    </div>
  );
}

export function Alert({ type = 'error', children }) {
  if (!children) return null;
  return <div className={`alert alert-${type}`}>{children}</div>;
}

const CATEGORY_ICON = {
  'Roads & Potholes': '🛣️',
  'Water Supply': '🚰',
  Electricity: '💡',
  'Sanitation & Garbage': '🗑️',
  'Street Lighting': '🔦',
  'Public Safety': '🚨',
  'Drainage & Sewage': '🌊',
  'Parks & Environment': '🌳',
  Other: '📌',
};

export function categoryIcon(category) {
  return CATEGORY_ICON[category] || '📌';
}

export function formatDate(value) {
  if (!value) return '—';
  // SQLite datetimes are stored as UTC "YYYY-MM-DD HH:MM:SS".
  const d = new Date(value.replace(' ', 'T') + 'Z');
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value.replace(' ', 'T') + 'Z');
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
