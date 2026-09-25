import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge, categoryIcon, formatDate } from './ui.jsx';

// Compact card used in the citizen dashboard list.
export default function ComplaintCard({ complaint, to }) {
  return (
    <Link to={to} className="complaint-card">
      <div className="complaint-card-top">
        <span className="complaint-cat">
          {categoryIcon(complaint.category)} {complaint.category}
        </span>
        <StatusBadge status={complaint.status} />
      </div>
      <h3 className="complaint-title">{complaint.title}</h3>
      <p className="complaint-desc">{complaint.description}</p>
      <div className="complaint-card-foot">
        <span className="complaint-code">{complaint.code}</span>
        <span className="muted">📍 {complaint.location}</span>
        <PriorityBadge priority={complaint.priority} />
        <span className="muted small">· {formatDate(complaint.created_at)}</span>
      </div>
    </Link>
  );
}
