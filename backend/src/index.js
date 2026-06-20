import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import dropsRouter from './routes/drops.js';
import reservationsRouter from './routes/reservations.js';
import usersRouter from './routes/users.js';
import { registerSocketHandlers } from './socket/index.js';
import { startExpiryService } from './services/expiryService.js';
import { errorHandler } from './middleware/errorHandler.js';
import { swaggerSpec } from './config/swagger.js';

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.get('/', (req, res) => res.json({ message: 'API is running', docs: '/api/docs' }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/openapi.json', (req, res) => res.json(swaggerSpec));

app.use('/api/drops', dropsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/users', usersRouter);

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Service is up
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 */
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

registerSocketHandlers(io);
startExpiryService(io);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
