import { db } from '../db.js';

const CITIZEN_JOIN = `
  SELECT c.*, u.name AS citizen_name, u.email AS citizen_email, u.phone AS citizen_phone
  FROM complaints c
  JOIN users u ON u.id = c.user_id
`;

export function createComplaint({ user_id, title, description, category, location, image_path = null, priority = 'Medium' }) {
  const info = db
    .prepare(
      `INSERT INTO complaints (user_id, title, description, category, location, image_path, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(user_id, title, description, category, location, image_path, priority);

  const id = Number(info.lastInsertRowid);
  // Human-friendly, unique public tracking ID, e.g. GRV-2026-00042
  const code = `GRV-${new Date().getFullYear()}-${String(id).padStart(5, '0')}`;
  db.prepare('UPDATE complaints SET code = ? WHERE id = ?').run(code, id);
  return getComplaintById(id);
}

export function getComplaintById(id) {
  return db.prepare(`${CITIZEN_JOIN} WHERE c.id = ?`).get(id);
}

export function getComplaintByCode(code) {
  return db.prepare(`${CITIZEN_JOIN} WHERE c.code = ?`).get(code);
}

export function listComplaintsByUser(userId) {
  return db.prepare(`${CITIZEN_JOIN} WHERE c.user_id = ? ORDER BY c.id DESC`).all(userId);
}

// Admin listing with optional filters.
export function listComplaints({ status, category, location, priority, q } = {}) {
  const where = [];
  const params = [];
  if (status) { where.push('c.status = ?'); params.push(status); }
  if (category) { where.push('c.category = ?'); params.push(category); }
  if (priority) { where.push('c.priority = ?'); params.push(priority); }
  if (location) { where.push('c.location LIKE ?'); params.push(`%${location}%`); }
  if (q) {
    where.push('(c.title LIKE ? OR c.description LIKE ? OR c.code LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return db.prepare(`${CITIZEN_JOIN} ${clause} ORDER BY c.id DESC`).all(...params);
}

const UPDATABLE = ['status', 'priority', 'department', 'officer', 'resolution_remarks', 'resolution_evidence_path'];

export function updateComplaint(id, fields) {
  const keys = Object.keys(fields).filter((k) => UPDATABLE.includes(k));
  if (keys.length === 0) return getComplaintById(id);
  const setSql = keys.map((k) => `${k} = ?`).join(', ');
  const params = keys.map((k) => fields[k]);
  db.prepare(`UPDATE complaints SET ${setSql}, updated_at = datetime('now') WHERE id = ?`).run(...params, id);
  return getComplaintById(id);
}

export function complaintStats() {
  const one = (sql, ...p) => db.prepare(sql).get(...p).n;
  return {
    total: one('SELECT COUNT(*) n FROM complaints'),
    submitted: one("SELECT COUNT(*) n FROM complaints WHERE status = 'Submitted'"),
    assigned: one("SELECT COUNT(*) n FROM complaints WHERE status = 'Assigned'"),
    inProgress: one("SELECT COUNT(*) n FROM complaints WHERE status = 'In Progress'"),
    resolved: one("SELECT COUNT(*) n FROM complaints WHERE status = 'Resolved'"),
    highPriority: one("SELECT COUNT(*) n FROM complaints WHERE priority = 'High' AND status != 'Resolved'"),
    byCategory: db
      .prepare('SELECT category, COUNT(*) n FROM complaints GROUP BY category ORDER BY n DESC')
      .all(),
    byStatus: db.prepare('SELECT status, COUNT(*) n FROM complaints GROUP BY status').all(),
  };
}
