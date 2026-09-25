import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, fileUrl } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Timeline from '../components/Timeline.jsx';
import { StatusBadge, PriorityBadge, Spinner, Alert, categoryIcon, formatDateTime } from '../components/ui.jsx';

export default function AdminComplaintDetails() {
  const { code } = useParams();
  const { token } = useAuth();
  const [c, setC] = useState(null);
  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState({ statuses: [], priorities: [], departments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [evidence, setEvidence] = useState(null);
  const [form, setForm] = useState({ status: '', priority: '', department: '', officer: '', resolution_remarks: '' });

  useEffect(() => {
    api.get('/admin/meta', token).then(setMeta).catch(() => {});
  }, [token]);

  async function load() {
    try {
      const res = await api.get(`/admin/complaints/${code}`, token);
      applyComplaint(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function applyComplaint(res) {
    setC(res.complaint);
    setEvents(res.events);
    setForm({
      status: res.complaint.status || '',
      priority: res.complaint.priority || '',
      department: res.complaint.department || '',
      officer: res.complaint.officer || '',
      resolution_remarks: res.complaint.resolution_remarks || '',
    });
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [code, token]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (evidence) fd.append('evidence', evidence);
      const res = await api.patchForm(`/admin/complaints/${code}`, fd, token);
      applyComplaint(res);
      setEvidence(null);
      setNotice('Complaint updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="container"><Spinner label="Loading complaint…" /></div>;
  if (!c) return <div className="container"><Alert>{error || 'Not found.'}</Alert><Link to="/admin" className="btn btn-outline">← Back</Link></div>;

  return (
    <div className="container">
      <Link to="/admin" className="btn btn-ghost btn-sm">← Back to dashboard</Link>

      <div className="detail-grid">
        <div className="detail-main-col">
          <div className="card">
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

            <dl className="info-list inline">
              <div><dt>Location</dt><dd>📍 {c.location}</dd></div>
              <div><dt>Reported by</dt><dd>{c.citizen_name}</dd></div>
              <div><dt>Contact</dt><dd>{c.citizen_email}{c.citizen_phone ? ` · ${c.citizen_phone}` : ''}</dd></div>
              <div><dt>Submitted</dt><dd>{formatDateTime(c.created_at)}</dd></div>
            </dl>

            {c.image_path && (
              <div className="detail-image">
                <img src={fileUrl(c.image_path)} alt="Complaint attachment" />
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="card-title">Status timeline</h3>
            <Timeline events={events} />
          </div>
        </div>

        <div className="detail-side">
          <form className="card manage-panel" onSubmit={handleSave}>
            <h3 className="card-title">⚙️ Manage complaint</h3>
            {notice && <Alert type="success">{notice}</Alert>}
            <Alert>{error}</Alert>

            <label className="field">
              <span>Status</span>
              <select value={form.status} onChange={update('status')}>
                {meta.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Priority</span>
              <select value={form.priority} onChange={update('priority')}>
                {meta.priorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Assign department</span>
              <select value={form.department} onChange={update('department')}>
                <option value="">— Not assigned —</option>
                {meta.departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Assign officer</span>
              <input value={form.officer} onChange={update('officer')} placeholder="Officer name" />
            </label>
            <label className="field">
              <span>Resolution remarks</span>
              <textarea rows={3} value={form.resolution_remarks} onChange={update('resolution_remarks')}
                placeholder="Add remarks when resolving…" />
            </label>
            <label className="field">
              <span>Resolution evidence <span className="muted small">(image/PDF)</span></span>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setEvidence(e.target.files?.[0] || null)} />
            </label>

            {c.resolution_evidence_path && (
              <a href={fileUrl(c.resolution_evidence_path)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                📎 Current evidence
              </a>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
              {saving ? <Spinner /> : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
