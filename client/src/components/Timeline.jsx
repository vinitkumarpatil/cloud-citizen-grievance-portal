import { formatDateTime } from './ui.jsx';

const EVENT_ICON = {
  created: '📝',
  status: '🔄',
  priority: '⚡',
  assignment: '👷',
  resolution: '✅',
  evidence: '📎',
};

// Vertical status timeline for a complaint.
export default function Timeline({ events = [] }) {
  if (!events.length) return <p className="muted">No activity yet.</p>;

  return (
    <ul className="timeline">
      {events.map((e) => (
        <li key={e.id} className="timeline-item">
          <span className="timeline-dot">{EVENT_ICON[e.type] || '•'}</span>
          <div className="timeline-content">
            <p className="timeline-message">{e.message}</p>
            <p className="timeline-meta">
              {e.actor ? `${e.actor} · ` : ''}
              {formatDateTime(e.created_at)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
