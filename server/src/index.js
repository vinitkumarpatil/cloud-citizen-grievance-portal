import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import './db.js'; // initialise the database + schema on import
import { seedIfEmpty } from './seed.js';

import authRoutes from './routes/auth.routes.js';
import complaintRoutes from './routes/complaints.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { notFound, errorHandler } from './middleware/error.js';

seedIfEmpty();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images/evidence. In the cloud this is replaced by object storage.
app.use('/uploads', express.static(config.uploadsDir));

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', service: 'grievance-portal-api', time: new Date().toISOString() })
);

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log('\n  Citizen Grievance Portal API');
  console.log(`  → http://localhost:${config.port}`);
  console.log(`  → health: http://localhost:${config.port}/api/health\n`);
});
