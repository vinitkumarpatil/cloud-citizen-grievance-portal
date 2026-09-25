// Thin fetch wrapper around the REST API.
// In dev, BASE is '' so calls hit /api/... and Vite proxies them to :4000.
// In the cloud, set VITE_API_URL to the backend origin.
const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, { method = 'GET', body, token, isForm } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (isForm) {
    payload = body; // FormData - let the browser set the multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}/api${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: (path, token) => request(path, { token }),
  post: (path, body, token) => request(path, { method: 'POST', body, token }),
  postForm: (path, body, token) => request(path, { method: 'POST', body, token, isForm: true }),
  patchForm: (path, body, token) => request(path, { method: 'PATCH', body, token, isForm: true }),
};

// Build an absolute URL for an uploaded file (image / evidence).
export function fileUrl(p) {
  if (!p) return null;
  return `${BASE}${p}`;
}
