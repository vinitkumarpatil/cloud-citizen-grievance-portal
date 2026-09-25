import multer from 'multer';
import path from 'node:path';
import { config } from '../config.js';

// Local disk storage for the demo. Swapping this for multer-s3 (or a signed-URL
// upload) is the single change needed to move file storage into the cloud.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ok = /^image\/(png|jpe?g|gif|webp)$/i.test(file.mimetype) || file.mimetype === 'application/pdf';
  if (ok) return cb(null, true);
  cb(new Error('Only image files (PNG, JPG, GIF, WEBP) or PDF are allowed.'));
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxUploadBytes },
});
