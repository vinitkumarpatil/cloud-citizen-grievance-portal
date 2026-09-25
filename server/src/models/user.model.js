import { db } from '../db.js';

export function createUser({ name, email, password_hash, role = 'citizen', phone = null }) {
  const info = db
    .prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)')
    .run(name, email, password_hash, role, phone);
  return findUserById(Number(info.lastInsertRowid));
}

export function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

// Strip the password hash before sending a user object to the client.
export function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    created_at: u.created_at,
  };
}
