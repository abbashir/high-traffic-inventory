import { Router } from 'express';
import { reserve, completePurchase, cancelReservation } from '../controllers/reservationsController.js';

const router = Router();

/**
 * @openapi
 * /api/reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Reserve an item for a 60-second checkout window
 *     description: >
 *       Atomically decrements `Drop.stock` with a single SQL UPDATE guarded by `WHERE stock > 0`.
 *       Under concurrent load, only as many requests as remaining stock can succeed; the rest get 409 OUT_OF_STOCK.
 *       A user can only hold one PENDING reservation per drop at a time (enforced by a DB partial unique index).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, dropId]
 *             properties:
 *               userId: { type: string, format: uuid }
 *               dropId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Reservation created and stock decremented
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reservation: { $ref: '#/components/schemas/Reservation' }
 *                 newStock: { type: integer, example: 4 }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Out of stock, or user already has a pending reservation for this drop
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               outOfStock: { value: { error: 'Item is out of stock', code: 'OUT_OF_STOCK' } }
 *               alreadyReserved: { value: { error: 'You already have a pending reservation for this drop', code: 'ALREADY_RESERVED' } }
 */
router.post('/', reserve);

/**
 * @openapi
 * /api/reservations/{id}/purchase:
 *   post:
 *     tags: [Reservations]
 *     summary: Complete checkout for a pending reservation
 *     description: >
 *       Only succeeds if the reservation belongs to userId, is still PENDING, and has not passed its
 *       60-second expiresAt. Stock is NOT returned on a completed purchase — it was already deducted at reserve time.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Reservation id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Purchase completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 purchase: { $ref: '#/components/schemas/Purchase' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Reservation is not PENDING, or has expired
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/:id/purchase', completePurchase);

/**
 * @openapi
 * /api/reservations/{id}:
 *   delete:
 *     tags: [Reservations]
 *     summary: Cancel a pending reservation and return its stock
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Reservation id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Reservation cancelled, stock restored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Reservation is not PENDING
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', cancelReservation);

export default router;
