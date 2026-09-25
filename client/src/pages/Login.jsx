import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert, Spinner } from '../components/ui.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const dest = location.state?.from || (user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fill(demoEmail, demoPass) {
    setEmail(demoEmail);
    setPassword(demoPass);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="muted">Log in to manage your grievances.</p>

        <Alert>{error}</Alert>

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email" required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" required />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <Spinner /> : 'Log In'}
          </button>
        </form>

        <p className="auth-alt">
          New here? <Link to="/register">Create an account</Link>
        </p>

        <div className="demo-box">
          <p className="demo-title">Demo accounts</p>
          <div className="demo-row">
            <div>
              <strong>Citizen</strong>
              <span className="muted small">citizen@demo.com / citizen123</span>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fill('citizen@demo.com', 'citizen123')}>Use</button>
          </div>
          <div className="demo-row">
            <div>
              <strong>Admin / Authority</strong>
              <span className="muted small">admin@portal.gov / admin123</span>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fill('admin@portal.gov', 'admin123')}>Use</button>
          </div>
        </div>
      </div>
    </div>
  );
}
