import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './database';
import notificationRoutes from '..//modules/routes/notification.routes'; 

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const app = express();
const httpServer = createServer(app);

// Configuração do WebSocket com mais eventos
export const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  path: '/socket.io',
});

// Middlewares
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Rotas
app.use('/api', notificationRoutes);

// Conexão WebSocket aprimorada
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Adicionado evento para solicitar atualização do histórico
  socket.on('requestHistoryUpdate', () => {
    console.log('History update requested by client:', socket.id);
    socket.emit('updateHistory');
  });

  socket.emit('notificationStatus', { status: 'connected' });
});

// Iniciar servidor
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(process.env.PORT || 3001, () => {
      console.log(`Server running on port ${process.env.PORT || 3001}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();