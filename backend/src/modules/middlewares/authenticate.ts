// backend/src/middlewares/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

interface JwtPayload {
  userId: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Obter o token do header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required'
      });
    }

    // 2. Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    // 3. Buscar usuário no banco
    const user = await User.findOne({ 
      _id: decoded.userId,
      'tokens.token': token // Verifica se o token ainda está ativo
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 4. Adicionar usuário e token ao request
    // req.user= user;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Please authenticate',
      error: error instanceof Error ? error.message : 'Invalid token'
    });
  }
};

// Extendendo a interface do Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: typeof User;
      token?: string;
    }
  }
}