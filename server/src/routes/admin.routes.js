import { Router } from 'express';
import { list, getOne, update, STATUSES, PRIORITIES, DEPARTMENTS } from '../controllers/admin.controller.js';
import { stats } from '../controllers/stats.controller.js';
import { authRequired, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Every admin route requires a valid token AND the admin role.
router.use(authRequired, adminOnly);

router.get('/meta', (req, res) =>
  res.json({ statuses: STATUSES, priorities: PRIORITIES, departments: DEPARTMENTS })
);
router.get('/stats', stats);
router.get('/complaints', list);
router.get('/complaints/:code', getOne);
router.patch('/complaints/:code', upload.single('evidence'), update);

export default router;
