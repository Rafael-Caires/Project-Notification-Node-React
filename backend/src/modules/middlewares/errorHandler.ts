// backend/src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { MongooseError } from 'mongoose';
import { JsonWebTokenError } from 'jsonwebtoken';


// Tipos de erros conhecidos
enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Formato padrão de resposta de erro
interface ErrorResponse {
  success: false;
  type: ErrorType;
  message: string;
  errors?: unknown[];
  stack?: string;
  metadata?: Record<string, unknown>;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });

  let statusCode = err.statusCode || 500;
  let errorType = ErrorType.UNKNOWN_ERROR;
  let errors: unknown[] | undefined;
  let metadata: Record<string, unknown> | undefined;

  if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    errorType = ErrorType.AUTH_ERROR;
  } else if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
    statusCode = err.statusCode;
    errorType = err.message.includes('Not found') 
      ? ErrorType.NOT_FOUND 
      : ErrorType.VALIDATION_ERROR;
  }

  const response: ErrorResponse = {
    success: false,
    type: errorType,
    message: statusCode === 500 ? 'Internal Server Error' : err.message,
    errors,
    metadata
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public type: ErrorType = ErrorType.VALIDATION_ERROR,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}