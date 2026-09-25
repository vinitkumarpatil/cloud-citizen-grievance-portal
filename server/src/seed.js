import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { createUser } from './models/user.model.js';
import { createComplaint, updateComplaint } from './models/complaint.model.js';
import { addEvent } from './models/event.model.js';

// Populates a fresh database with an admin, a demo citizen and a handful of
// realistic complaints so the dashboards and statistics look alive on first run.
export function seedIfEmpty() {
  const { n } = db.prepare('SELECT COUNT(*) n FROM users').get();
  if (n > 0) return;

  createUser({
    name: 'City Admin',
    email: 'admin@portal.gov',
    password_hash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
  });

  const citizen = createUser({
    name: 'Asha Sharma',
    email: 'citizen@demo.com',
    password_hash: bcrypt.hashSync('citizen123', 10),
    role: 'citizen',
    phone: '+91 98765 43210',
  });

  const samples = [
    {
      title: 'Large pothole causing traffic near MG Road junction',
      description:
        'A deep pothole has formed at the MG Road junction. Two-wheelers are skidding, especially at night. Needs urgent repair before an accident happens.',
      category: 'Roads & Potholes',
      location: 'MG Road Junction, Sector 12',
      priority: 'High',
      department: 'Traffic & Roads',
      officer: 'Eng. R. Verma',
      status: 'In Progress',
    },
    {
      title: 'No water supply for the last 3 days',
      description:
        'Our entire lane has had no municipal water supply since Monday. We are dependent on tankers. Please restore supply.',
      category: 'Water Supply',
      location: 'Green Park Colony, Block C',
      priority: 'High',
      department: 'Water Board',
      officer: 'Ms. K. Nair',
      status: 'Resolved',
      remarks: 'Burst pipeline located and repaired. Supply restored on 22 Sep. Kindly confirm.',
    },
    {
      title: 'Street light not working for two weeks',
      description:
        'The street light near the community park has been off for two weeks making the area unsafe after dark.',
      category: 'Street Lighting',
      location: 'Community Park, Sector 8',
      priority: 'Medium',
      department: 'Electricity Board',
      status: 'Assigned',
    },
    {
      title: 'Garbage not collected in our area',
      description:
        'Garbage has been piling up on the street corner for over a week. It is causing a foul smell and health concerns.',
      category: 'Sanitation & Garbage',
      location: 'Nehru Nagar, Lane 4',
      priority: 'Medium',
      status: 'Submitted',
    },
    {
      title: 'Overflowing drain flooding the footpath',
      description:
        'The drain near the market is blocked and overflowing onto the footpath. Pedestrians have to walk on the road.',
      category: 'Drainage & Sewage',
      location: 'Market Road, Sector 5',
      priority: 'High',
      status: 'Submitted',
    },
    {
      title: 'Broken park benches and unsafe play area',
      description:
        'Several benches in the public park are broken and the children play area has exposed metal edges.',
      category: 'Parks & Environment',
      location: 'Rose Garden Park',
      priority: 'Low',
      department: 'Parks & Recreation',
      status: 'In Progress',
    },
  ];

  for (const s of samples) {
    const c = createComplaint({
      user_id: citizen.id,
      title: s.title,
      description: s.description,
      category: s.category,
      location: s.location,
      priority: s.priority,
    });
    addEvent(c.id, 'created', 'Complaint submitted by citizen.', citizen.name);

    const changes = { priority: s.priority };
    if (s.department) {
      changes.department = s.department;
      addEvent(c.id, 'assignment', `Assigned to ${s.department}.`, 'City Admin (Official)');
    }
    if (s.officer) {
      changes.officer = s.officer;
      addEvent(c.id, 'assignment', `Officer ${s.officer} assigned to handle this complaint.`, 'City Admin (Official)');
    }
    if (s.status && s.status !== 'Submitted') {
      changes.status = s.status;
      addEvent(c.id, 'status', `Status changed to "${s.status}".`, 'City Admin (Official)');
    }
    if (s.remarks) {
      changes.resolution_remarks = s.remarks;
      addEvent(c.id, 'resolution', 'Resolution remarks added.', 'City Admin (Official)');
    }
    updateComplaint(c.id, changes);
  }

  console.log('  Seeded demo data: 1 admin, 1 citizen, ' + samples.length + ' complaints.');
}

// Allow running `npm run seed` directly (resets nothing - only seeds if empty).
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  seedIfEmpty();
  console.log('Seed check complete.');
}
