import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IAuthService } from '../contracts/auth.service.contract.js';
import { ValidationError } from '../lib/errors.js';

const registerSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }).max(128),
  name: z.string(),
  bio: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email address' }),
  password: z.string().min(1),
});

// Safe select: all non-sensitive fields returned from register / embedded in JWT
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        const message = parsed.error.errors.map((e) => e.message).join(', ');
        throw new ValidationError(message);
      }

      const result = await this.authService.register(parsed.data);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        const message = parsed.error.errors.map((e) => e.message).join(', ');
        throw new ValidationError(message);
      }

      const email = parsed.data.email;
      const password = parsed.data.password;
      const result = await this.authService.login(parsed.data);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
