import express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: 'admin' | 'staff';
      };
    }
  }
}

export interface AuthenticatedRequest extends express.Request {
  user: {
    userId: string;
    role: 'admin' | 'staff';
  };
}
