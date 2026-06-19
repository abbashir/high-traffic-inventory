import { Router } from 'express';
import { reserve, completePurchase, cancelReservation } from '../controllers/reservationsController.js';

const router = Router();

router.post('/', reserve);
router.post('/:id/purchase', completePurchase);
router.delete('/:id', cancelReservation);

export default router;
