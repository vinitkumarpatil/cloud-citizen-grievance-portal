import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthed, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">🏛️</span>
          <span className="brand-text">
            City<strong>Fix</strong>
          </span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/track" className="nav-link">Track Complaint</NavLink>

          {!isAuthed && (
            <>
              <NavLink to="/login" className="nav-link">Login</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}

          {isAuthed && !isAdmin && (
            <>
              <NavLink to="/dashboard" className="nav-link">My Dashboard</NavLink>
              <Link to="/complaints/new" className="btn btn-primary btn-sm">+ New Complaint</Link>
            </>
          )}

          {isAuthed && isAdmin && (
            <NavLink to="/admin" className="nav-link">Admin Dashboard</NavLink>
          )}

          {isAuthed && (
            <div className="nav-user">
              <span className="nav-avatar" title={user?.email}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
