// backend/src/config/database.ts
import mongoose from 'mongoose';

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

// Configuração da conexão
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notificationDB';

// 2. Configurações do Mongoose
mongoose.set('strictQuery', true); // Para suprimir aviso de depreciação
mongoose.set('bufferCommands', false); // Desativa buffering de comandos
mongoose.set('autoIndex', process.env.NODE_ENV !== 'production'); // Indexação automática apenas em dev

// 3. Cache de conexão para hot-reload
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

// 4. Função principal de conexão
export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 segundos
      socketTimeoutMS: 45000, // 45 segundos
    };

    console.log(`Connecting to MongoDB at ${MONGODB_URI}`);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then(mongoose => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
};

// 5. Função para testes (opcional)
// export const setupTestDB = async () => {
//   if (process.env.NODE_ENV === 'test') {
//     const { MongoMemoryServer } = await import('mongodb-memory-server');
//     const mongoServer = await MongoMemoryServer.create();
//     const uri = mongoServer.getUri();
    
//     await mongoose.connect(uri);
    
//     return {
//       close: async () => {
//         await mongoose.disconnect();
//         await mongoServer.stop();
//       }
//     };
//   }
// };