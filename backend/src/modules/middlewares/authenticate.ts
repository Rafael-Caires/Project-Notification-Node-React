// backend/src/middlewares/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

interface JwtPayload {
  userId: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    const user = await User.findOne({ 
      _id: decoded.userId,
      'tokens.token': token 
    });

    if (!user) {
      throw new Error('User not found');
    }

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

declare global {
  namespace Express {
    interface Request {
      user?: typeof User;
      token?: string;
    }
  }
}