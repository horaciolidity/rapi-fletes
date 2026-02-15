import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trip.js';
import paymentRoutes from './routes/payment.js';
import { initSockets } from './sockets/index.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/payments', paymentRoutes);

// Socket initialization
initSockets(io);

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Rapi Fletes Server running on port ${PORT}`);
    });
}

export default app;
