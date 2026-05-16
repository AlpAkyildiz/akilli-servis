import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import routeRoutes from './routes/routeRoutes';
import { setupTrackingSocket } from './sockets/trackingHandler';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/routes', routeRoutes);

app.get('/', (req, res) => {
  res.send('Akıllı Servis API Çalışıyor 🚀');
});

// Socket.IO Setup
setupTrackingSocket(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`✅ Sunucu ${PORT} portunda başlatıldı.`);
});
