import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert, Spinner } from '../components/ui.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="muted">Register as a citizen to report and track grievances.</p>

        <Alert>{error}</Alert>

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Full name</span>
            <input value={form.name} onChange={update('name')} placeholder="Asha Sharma" required />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
          </label>
          <label className="field">
            <span>Phone <span className="muted small">(optional)</span></span>
            <input value={form.phone} onChange={update('phone')} placeholder="+91 98765 43210" />
          </label>
          <div className="form-row">
            <label className="field">
              <span>Password</span>
              <input type="password" value={form.password} onChange={update('password')} placeholder="Min. 6 characters" required />
            </label>
            <label className="field">
              <span>Confirm password</span>
              <input type="password" value={form.confirm} onChange={update('confirm')} placeholder="Repeat password" required />
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <Spinner /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-alt">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
