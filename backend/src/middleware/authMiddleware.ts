import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dunia_secret_key';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: 'CUSTOMER' | 'ADMIN';
  };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token;

  console.log('Authorization Header:', req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // RUNTIME EVALUATION: Evaluates the secret only when the request is processed
      const secret = process.env.JWT_SECRET || 'dunia_secret_key';

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: 'CUSTOMER' | 'ADMIN' };
      req.user = { userId: decoded.userId, role: decoded.role };
      
      return next(); // Add "return" here to stop executing the rest of the function
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token invalid or expired' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
};