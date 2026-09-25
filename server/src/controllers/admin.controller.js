import { getComplaintByCode, listComplaints, updateComplaint, complaintStats } from '../models/complaint.model.js';
import { addEvent, listEvents } from '../models/event.model.js';

export const STATUSES = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];
export const PRIORITIES = ['Low', 'Medium', 'High'];
export const DEPARTMENTS = [
  'Public Works Department',
  'Water Board',
  'Electricity Board',
  'Sanitation Department',
  'Municipal Health Department',
  'Traffic & Roads',
  'Parks & Recreation',
];

export function list(req, res) {
  const { status, category, location, priority, q } = req.query;
  res.json({ complaints: listComplaints({ status, category, location, priority, q }) });
}

export function getOne(req, res) {
  const complaint = getComplaintByCode(req.params.code);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
  res.json({ complaint, events: listEvents(complaint.id) });
}

// Admin action: change status / priority / assignment / resolution in one call.
// Every meaningful change is recorded on the complaint's timeline.
export function update(req, res) {
  const current = getComplaintByCode(req.params.code);
  if (!current) return res.status(404).json({ error: 'Complaint not found.' });

  const { status, priority, department, officer, resolution_remarks } = req.body;
  const changes = {};
  const events = [];
  const actor = `${req.user.name} (Official)`;

  if (status && status !== current.status) {
    if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status value.' });
    changes.status = status;
    events.push(['status', `Status changed to "${status}".`]);
  }
  if (priority && priority !== current.priority) {
    if (!PRIORITIES.includes(priority)) return res.status(400).json({ error: 'Invalid priority value.' });
    changes.priority = priority;
    events.push(['priority', `Priority set to "${priority}".`]);
  }
  if (department !== undefined && department !== (current.department || '')) {
    changes.department = department || null;
    if (department) events.push(['assignment', `Assigned to ${department}.`]);
  }
  if (officer !== undefined && officer !== (current.officer || '')) {
    changes.officer = officer || null;
    if (officer) events.push(['assignment', `Officer ${officer} assigned to handle this complaint.`]);
  }
  if (resolution_remarks !== undefined && resolution_remarks !== (current.resolution_remarks || '')) {
    changes.resolution_remarks = resolution_remarks || null;
    if (resolution_remarks) events.push(['resolution', 'Resolution remarks added.']);
  }
  if (req.file) {
    changes.resolution_evidence_path = `/uploads/${req.file.filename}`;
    events.push(['evidence', 'Resolution evidence attached.']);
  }

  // Convenience: assigning a department on a brand-new complaint moves it to "Assigned".
  if (changes.department && !changes.status && current.status === 'Submitted') {
    changes.status = 'Assigned';
    events.push(['status', 'Status changed to "Assigned".']);
  }

  if (Object.keys(changes).length === 0) {
    return res.status(400).json({ error: 'No changes were provided.' });
  }

  updateComplaint(current.id, changes);
  for (const [type, message] of events) addEvent(current.id, type, message, actor);

  const updated = getComplaintByCode(req.params.code);
  res.json({ complaint: updated, events: listEvents(updated.id) });
}
