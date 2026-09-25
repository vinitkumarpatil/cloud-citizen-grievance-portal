import { Router } from 'express';
import { create, listMine, getOne, trackPublic, CATEGORIES } from '../controllers/complaints.controller.js';
import { authRequired } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Expose the category list so the frontend form stays in sync with the backend.
router.get('/meta/categories', (req, res) => res.json({ categories: CATEGORIES }));

// Public tracking by complaint ID (no auth) - powers the "Track" page.
router.get('/track/:code', trackPublic);

router.post('/', authRequired, upload.single('image'), create);
router.get('/mine', authRequired, listMine);
router.get('/:code', authRequired, getOne);

export default router;
