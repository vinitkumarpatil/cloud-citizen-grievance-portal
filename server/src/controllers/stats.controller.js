import { complaintStats } from '../models/complaint.model.js';

export function stats(req, res) {
  res.json(complaintStats());
}
