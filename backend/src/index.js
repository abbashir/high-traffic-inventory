import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dropsRouter from './routes/drops.js';
import reservationsRouter from './routes/reservations.js';
import usersRouter from './routes/users.js';
import { registerSocketHandlers } from './socket/index.js';
import { startExpiryService } from './services/expiryService.js';
import { errorHandler } from './middleware/errorHandler.js';

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

app.use('/api/drops', dropsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/users', usersRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

registerSocketHandlers(io);
startExpiryService(io);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
