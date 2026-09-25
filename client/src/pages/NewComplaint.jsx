import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert, Spinner, categoryIcon } from '../components/ui.jsx';

const FALLBACK_CATEGORIES = [
  'Roads & Potholes', 'Water Supply', 'Electricity', 'Sanitation & Garbage',
  'Street Lighting', 'Public Safety', 'Drainage & Sewage', 'Parks & Environment', 'Other',
];

export default function NewComplaint() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [form, setForm] = useState({ title: '', category: '', location: '', description: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    api.get('/complaints/meta/categories')
      .then((d) => d.categories?.length && setCategories(d.categories))
      .catch(() => {});
  }, []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function onImage(e) {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.title || !form.category || !form.location || !form.description) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      const data = await api.postForm('/complaints', fd, token);
      setCreated(data.complaint);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    return (
      <div className="container narrow">
        <div className="success-panel">
          <div className="success-check">✅</div>
          <h1>Complaint submitted!</h1>
          <p className="muted">Save your tracking ID to follow the progress any time.</p>
          <div className="code-chip">{created.code}</div>
          <div className="success-actions">
            <Link to={`/complaints/${created.code}`} className="btn btn-primary">View details</Link>
            <Link to="/dashboard" className="btn btn-outline">Go to dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container narrow">
      <div className="page-head">
        <div>
          <h1>Report a grievance</h1>
          <p className="muted">Give us the details and we'll route it to the right department.</p>
        </div>
        <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back</Link>
      </div>

      <Alert>{error}</Alert>

      <form onSubmit={handleSubmit} className="form card">
        <label className="field">
          <span>Title *</span>
          <input value={form.title} onChange={update('title')} placeholder="e.g. Broken street light on Main Road" required />
        </label>

        <div className="form-row">
          <label className="field">
            <span>Category *</span>
            <select value={form.category} onChange={update('category')} required>
              <option value="" disabled>Choose a category…</option>
              {categories.map((c) => (
                <option key={c} value={c}>{categoryIcon(c)} {c}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Location *</span>
            <input value={form.location} onChange={update('location')} placeholder="Area, street or landmark" required />
          </label>
        </div>

        <label className="field">
          <span>Description *</span>
          <textarea rows={5} value={form.description} onChange={update('description')}
            placeholder="Describe the issue in detail — what, where and since when." required />
        </label>

        <label className="field">
          <span>Photo <span className="muted small">(optional, max 5 MB)</span></span>
          <input type="file" accept="image/*" onChange={onImage} />
        </label>
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? <Spinner /> : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
}
