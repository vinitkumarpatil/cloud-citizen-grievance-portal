import {
  createComplaint,
  getComplaintByCode,
  listComplaintsByUser,
} from '../models/complaint.model.js';
import { addEvent, listEvents } from '../models/event.model.js';

export const CATEGORIES = [
  'Roads & Potholes',
  'Water Supply',
  'Electricity',
  'Sanitation & Garbage',
  'Street Lighting',
  'Public Safety',
  'Drainage & Sewage',
  'Parks & Environment',
  'Other',
];

// Citizen: submit a new complaint (optional image via multipart/form-data).
export function create(req, res) {
  const { title, description, category, location } = req.body;
  if (!title || !description || !category || !location) {
    return res.status(400).json({ error: 'Title, description, category and location are all required.' });
  }
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Please choose a valid category.' });
  }

  const image_path = req.file ? `/uploads/${req.file.filename}` : null;
  const complaint = createComplaint({
    user_id: req.user.id,
    title: title.trim(),
    description: description.trim(),
    category,
    location: location.trim(),
    image_path,
  });

  addEvent(complaint.id, 'created', 'Complaint submitted by citizen.', req.user.name);
  res.status(201).json({ complaint, events: listEvents(complaint.id) });
}

// Citizen: list only the logged-in user's complaints.
export function listMine(req, res) {
  res.json({ complaints: listComplaintsByUser(req.user.id) });
}

// Citizen/Admin: full detail for a complaint the caller is allowed to see.
export function getOne(req, res) {
  const complaint = getComplaintByCode(req.params.code);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
  if (req.user.role !== 'admin' && complaint.user_id !== req.user.id) {
    return res.status(403).json({ error: 'You do not have access to this complaint.' });
  }
  res.json({ complaint, events: listEvents(complaint.id) });
}

// Public: anyone with the tracking ID can see status + timeline (no login needed).
export function trackPublic(req, res) {
  const c = getComplaintByCode(req.params.code);
  if (!c) return res.status(404).json({ error: 'No complaint found with that tracking ID.' });
  res.json({
    complaint: {
      code: c.code,
      title: c.title,
      category: c.category,
      location: c.location,
      status: c.status,
      priority: c.priority,
      department: c.department,
      citizen_name: c.citizen_name,
      created_at: c.created_at,
      updated_at: c.updated_at,
      resolution_remarks: c.resolution_remarks,
    },
    events: listEvents(c.id),
  });
}
