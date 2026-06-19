import { Router } from 'express';
import { createDrop, listDrops, getDrop } from '../controllers/dropsController.js';

const router = Router();

router.get('/', listDrops);
router.post('/', createDrop);
router.get('/:id', getDrop);

export default router;
