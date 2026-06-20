import { Router } from 'express';
import { createUser, listUsers } from '../controllers/usersController.js';

const router = Router();

/**
 * @openapi
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a user (dev-only seeding, no auth)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email]
 *             properties:
 *               username: { type: string, example: bashir }
 *               email: { type: string, format: email, example: bashir@test.com }
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: username or email already exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', createUser);

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 */
router.get('/', listUsers);

export default router;
