import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './database'; // A partir do seu código anterior
import notificationRoutes from '../modules/routes/notification.routes';  // Importar as rotas

// Carregar as variáveis de ambiente
dotenv.config();

// Configuração do FRONTEND_URL
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Criar a aplicação e configurar o servidor HTTP
const app = express();
const httpServer = createServer(app);

// Configurar o WebSocket
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  path: '/socket.io', // Certificando-se de que o caminho está configurado
});

// Middlewares
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Adicionando os métodos necessários
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Usando o body-parser para fazer o parsing dos dados JSON
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Registrar as rotas após o servidor ser iniciado
app.use('/api', notificationRoutes);

// Verificando as rotas registradas
httpServer.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on port ${process.env.PORT || 3001}`);
  
  // Aqui fazemos o log após o servidor estar escutando
  console.log('\n📡 Rotas registradas:');
  notificationRoutes.stack.forEach((layer) => {
    if (layer.route?.path) {
      console.log(`→ /api${layer.route.path}`);
    }
  });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Aqui você pode adicionar eventos personalizados para seu WebSocket
});

// Função para conectar ao banco de dados
const startServer = async () => {
  try {
    // Conectar ao banco de dados
    await connectDB();

    // Não é necessário chamar httpServer.listen() aqui, pois já estamos chamando no callback acima
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startServer();


