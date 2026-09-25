import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-content">
          <span className="pill">☁️ Cloud-based Civic Platform</span>
          <h1>
            Report civic issues.<br />
            <span className="grad">Track them to resolution.</span>
          </h1>
          <p className="hero-sub">
            CityFix connects citizens with local authorities. Raise a grievance in seconds,
            get a unique tracking ID, and follow every status update until it's resolved.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">Report a Grievance</Link>
            <Link to="/track" className="btn btn-outline btn-lg">Track Existing Complaint</Link>
          </div>
          <div className="hero-trust">
            <div><strong>4</strong><span>status stages</span></div>
            <div><strong>9</strong><span>categories</span></div>
            <div><strong>24/7</strong><span>online reporting</span></div>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-head">
            <span className="badge status-progress">In Progress</span>
            <span className="complaint-code">GRV-2026-00042</span>
          </div>
          <h3>🛣️ Pothole near MG Road junction</h3>
          <p className="muted">📍 Sector 12 · Traffic &amp; Roads Dept</p>
          <ul className="mini-timeline">
            <li className="done">Submitted</li>
            <li className="done">Assigned to department</li>
            <li className="active">Work in progress</li>
            <li>Resolved</li>
          </ul>
        </div>
      </section>

      <section className="features">
        <h2>How it works</h2>
        <div className="feature-grid">
          <Feature icon="🧾" title="1. Submit" text="Describe the issue, pick a category, add a location and an optional photo." />
          <Feature icon="🆔" title="2. Get an ID" text="Receive a unique complaint ID to track your grievance any time." />
          <Feature icon="👷" title="3. Assigned" text="Authorities review, set priority and assign it to the right department." />
          <Feature icon="✅" title="4. Resolved" text="Follow live status updates and see the resolution with evidence." />
        </div>
      </section>

      <section className="cta-band">
        <div>
          <h2>Have an issue in your neighbourhood?</h2>
          <p className="muted">It takes less than a minute to report.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
          Get Started
        </button>
      </section>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p className="muted">{text}</p>
    </div>
  );
}
