import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Server root (the /server folder). Data + uploads live under here locally,
// but every path is centralised so a cloud deployment can override them.
export const ROOT = path.resolve(__dirname, '..');

export const config = {
  port: Number(process.env.PORT) || 4000,
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev_super_secret_change_me',
  jwtExpiresIn: '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  dataDir: path.join(ROOT, 'data'),
  uploadsDir: path.join(ROOT, 'uploads'),
  maxUploadBytes: 5 * 1024 * 1024, // 5 MB
};
