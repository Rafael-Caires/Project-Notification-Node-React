import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './database';
import notificationRoutes from '..//modules/routes/notification.routes'; 
import { ChannelService } from '../modules/channels/channel.service';

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL;
const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  path: '/socket.io',
});

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api', notificationRoutes);

io.on('connection', (socket) => {
  socket.on('requestHistoryUpdate', () => {
    socket.emit('updateHistory');
  });

  socket.emit('notificationStatus', { status: 'connected' });
});

const startServer = async () => {
  try {
    await connectDB();
    await ChannelService.initializeDefaultChannels();
    httpServer.listen(process.env.PORT || 3001, () => {
      console.log(`Server rodando na porta ${process.env.PORT || 3001}`);
    });
  } catch (error) {
    console.error('Erro ao Iniciar o server:', error);
    process.exit(1);
  }
};

startServer();