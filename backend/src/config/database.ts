// backend/src/config/database.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// 1. Interface para tipagem global
declare global {
  namespace NodeJS {
    interface Global {
      mongoose: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      };
    }
  }
}

// 2. Validação da variável de ambiente
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// 3. Configurações do Mongoose
mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false);
mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');

// 4. Cache de conexão
const globalWithMongoose = global as typeof global & {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

// 5. Função de conexão com tratamento de tipos
export const connectDB = async (): Promise<typeof mongoose> => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    console.log(`Conectando ao MongoDB na URL: ${MONGODB_URI}`);
    console.log(`Verifique o .env em caso de falha`);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then(mongoose => {
        console.log('MongoDB Conexão Realizada com Sucesso');
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB Falha ao conectar:', err);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
        
    await import('../seed/channels.seed').then(({ seedChannels }) => seedChannels());
    await import('../seed/notifications.seed').then(({ seedNotifications }) => seedNotifications());
    
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
};