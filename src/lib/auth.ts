import { Request, Response, NextFunction } from 'express';
import { ITokenService } from '../contracts/token-service.contract.js';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function createAuthenticate(tokenService: ITokenService) {
  return async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      req.user = (await tokenService.verify(token)) as unknown as AuthUser;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
