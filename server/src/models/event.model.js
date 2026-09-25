import { db } from '../db.js';

// A single entry in a complaint's status timeline.
export function addEvent(complaintId, type, message, actor = null) {
  db.prepare(
    'INSERT INTO complaint_events (complaint_id, type, message, actor) VALUES (?, ?, ?, ?)'
  ).run(complaintId, type, message, actor);
}

export function listEvents(complaintId) {
  return db
    .prepare('SELECT * FROM complaint_events WHERE complaint_id = ? ORDER BY id ASC')
    .all(complaintId);
}
