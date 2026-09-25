# 🏛️ CityFix — Cloud-Based Citizen Grievance / Complaint Portal

A complete, demo-ready web portal where **citizens** report civic complaints (roads, water, electricity, sanitation…) and **city authorities** triage, assign, and resolve them from an admin dashboard. Built to run locally in minutes, with a clean path to cloud deployment.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/vinitkumarpatil/cloud-citizen-grievance-portal)

---

## 🧭 Problem statement

Citizens today have no single, transparent channel to report civic issues (potholes, broken street lights, water/drainage failures, uncollected garbage) and — more importantly — no way to **track what happens after they report**. Complaints get lost across phone calls, registers, and disconnected departments, so citizens are left in the dark and authorities have no consolidated view to prioritise and act.

**CityFix** solves this with one cloud-ready portal:
- Citizens file a complaint in seconds and receive a **unique tracking ID**.
- Every status change (Submitted → Assigned → In Progress → Resolved) is timestamped on a **public, transparent timeline**.
- Authorities get a **single dashboard** to filter, prioritise, assign to departments/officers, and close issues with resolution evidence.
- The architecture is deliberately **cloud-portable** — a demo runs locally, but the database, file storage, and API can each be swapped to managed cloud services without touching the frontend.

---

## ✨ Features

### Citizen
- Register / login (JWT auth)
- Submit a complaint: title, description, category, location, optional image
- Get a unique tracking ID (`GRV-2026-00001`)
- View all your complaints with live status
- Complaint detail page with a full status **timeline**
- Public **Track** page — look up any complaint by ID, no login needed

### Authority / Admin
- Dashboard with stats: total, pending, in progress, resolved, high-priority open
- Complaints-by-category bar chart
- Filter by status, category, priority + free-text search
- Complaint detail with full management panel:
  - Change status (Submitted → Assigned → In Progress → Resolved)
  - Assign department & officer
  - Set priority
  - Add resolution remarks
  - Upload resolution evidence (image / PDF)
- Every change is recorded on the complaint timeline, visible to the citizen

---

## 🧱 Architecture

```
Browser (React SPA, Vite)
        │  REST /api  (JWT Bearer)
        ▼
Node.js + Express API
        │
        ├── SQLite (node:sqlite)      ← swap for PostgreSQL in cloud
        └── local /uploads disk store ← swap for S3 / blob storage in cloud
```

| Layer     | Local (demo)            | Cloud-ready swap                          |
|-----------|-------------------------|-------------------------------------------|
| Frontend  | Vite dev server         | Static host / CDN (S3+CloudFront, Vercel) |
| Backend   | Express on `:4000`      | Container / App Runner / ECS / Lambda     |
| Database  | `node:sqlite` file      | `DATABASE_URL` → managed PostgreSQL       |
| Storage   | `server/uploads/`       | S3 bucket (`fileUrl` already abstracted)  |
| Auth      | JWT (`JWT_SECRET`)      | Same, secret from a secrets manager       |

The frontend talks to the backend only through the `/api` and `/uploads` prefixes, proxied by Vite in dev — so pointing at a cloud backend is a one-variable change (`VITE_API_URL`).

**Tech:** React 18, React Router 6, Vite 5 · Node.js + Express 4 (ESM) · `node:sqlite` · JWT · bcryptjs · multer. No native builds, no external DB server.

---

## ☁️ How the cloud component is intended to work

The app runs entirely locally for the demo, but every external dependency is isolated behind a single seam so it can move to the cloud with **no frontend rewrite**:

1. **Database** — the demo uses the built-in `node:sqlite` file (`server/data/grievance.db`). All data access lives in `server/src/models/*`. In the cloud, a `DATABASE_URL` points these models at a **managed PostgreSQL** instance (e.g. Amazon RDS / Aurora, Azure Database, Cloud SQL). Only the model layer changes; controllers/routes stay identical.
2. **File storage** — uploaded complaint images and resolution evidence are written to `server/uploads/` and served at `/uploads/...`. The frontend never hardcodes this — it uses a `fileUrl()` helper. In the cloud, uploads go to an **object store (Amazon S3 / Azure Blob / GCS)** and `fileUrl()` returns the bucket/CDN URL.
3. **API tier** — the stateless Express API is container-ready and can be deployed to **App Runner / ECS / Cloud Run / Azure App Service**, or adapted to serverless. It scales horizontally because auth is JWT (no server-side sessions).
4. **Frontend** — the built SPA (`npm run build`) is fully static and deploys to a **CDN / static host** (S3+CloudFront, Vercel, Azure Static Web Apps). It reaches the cloud API via `VITE_API_URL`.
5. **Secrets** — `JWT_SECRET` and DB credentials come from environment variables, ready to be sourced from a **secrets manager** rather than a checked-in file.

This means the exact project in this repo is the "local demo" mode of a genuinely cloud-native design — the cloud migration is configuration, not a rebuild.

---

## 🚀 Run locally

**Prerequisites:** Node.js **v22.5+** (uses the built-in `node:sqlite` module; tested on v24). Check with `node -v`.

### 1. Backend  → http://localhost:4000
```bash
cd server
npm install
npm start
```

### 2. Frontend → http://localhost:5173
Open a **second terminal**:
```bash
cd client
npm install
npm run dev
```

Then open **http://localhost:5173**.

> The database auto-seeds on first start (1 admin, 1 citizen, 6 sample complaints). To reset to clean demo data, stop the backend, delete `server/data/grievance.db*`, then run `npm run seed` in `server/`.

---

## 🔑 Demo accounts

| Role    | Email               | Password   |
|---------|---------------------|------------|
| Admin   | `admin@portal.gov`  | `admin123` |
| Citizen | `citizen@demo.com`  | `citizen123` |

(The login page also has one-click "fill demo account" buttons.)

---

## 🎬 Demo script

1. **Citizen** logs in (`citizen@demo.com`) → **New Complaint** → submit → gets an ID like `GRV-2026-00007`.
2. Copy the ID → open **Track** (or log out and track publicly) → see status **Submitted**.
3. **Admin** logs in (`admin@portal.gov`) → dashboard shows updated stats + the new complaint in the table.
4. Admin opens the complaint → assigns a **department + officer** (auto-moves to **Assigned**) → sets status **In Progress** → then **Resolved** with remarks + evidence.
5. Back as the **citizen** (or the Track page) → the complaint now shows **Resolved** with the full timeline and resolution.
6. Dashboard stats update live from the data.

---

## ⚙️ Environment variables (`server/.env`)

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=dev_super_secret_change_me_in_production
CLIENT_ORIGIN=http://localhost:5173
```

Optional frontend override (`client/.env`) when pointing at a deployed backend:
```env
VITE_API_URL=https://your-api-host
```

---

## 📁 Project structure

```
TCS/
├── server/                 # Express API
│   ├── src/
│   │   ├── config.js  db.js  seed.js  index.js
│   │   ├── models/         # user, complaint, event
│   │   ├── middleware/      # auth, upload, error
│   │   ├── controllers/     # auth, complaints, admin, stats
│   │   └── routes/          # auth, complaints, admin
│   ├── data/               # SQLite file (auto-created)
│   └── uploads/            # uploaded images / evidence
└── client/                 # React + Vite SPA
    └── src/
        ├── api/  context/  components/  pages/
        ├── App.jsx  main.jsx  index.css
        └── ...
```
