import { Router } from 'express';
import { createDrop, listDrops, getDrop } from '../controllers/dropsController.js';

const router = Router();

/**
 * @openapi
 * /api/drops:
 *   get:
 *     tags: [Drops]
 *     summary: List all active drops with their top 3 most recent purchasers
 *     responses:
 *       200:
 *         description: List of active drops
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 drops:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Drop' }
 */
router.get('/', listDrops);

/**
 * @openapi
 * /api/drops:
 *   post:
 *     tags: [Drops]
 *     summary: Create a new merch drop
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, totalStock, price, startsAt]
 *             properties:
 *               name: { type: string, example: 'Air Jordan 1 - Chicago' }
 *               description: { type: string, example: 'OG colorway, limited to 100 pairs' }
 *               imageUrl: { type: string, example: 'https://example.com/aj1.jpg' }
 *               totalStock: { type: integer, minimum: 1, example: 100 }
 *               price: { type: number, format: float, minimum: 0.01, example: 180.00 }
 *               startsAt: { type: string, format: date-time, example: '2025-07-01T12:00:00Z' }
 *               endsAt: { type: string, format: date-time, example: '2025-07-01T18:00:00Z' }
 *     responses:
 *       201:
 *         description: Drop created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 drop: { $ref: '#/components/schemas/Drop' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', createDrop);

/**
 * @openapi
 * /api/drops/{id}:
 *   get:
 *     tags: [Drops]
 *     summary: Get a single drop by id, including its top 3 most recent purchasers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The drop
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 drop: { $ref: '#/components/schemas/Drop' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', getDrop);

export default router;
