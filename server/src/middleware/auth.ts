import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload, Role } from '../types';
import { sendError } from '../utils';

const JWT_SECRET = process.env.JWT_SECRET || 'siet-esports-secret-change-in-production';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return sendError(res, 'Authentication required', 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = { id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role };
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, 'Authentication required', 401);
    if (!roles.includes(req.user.role)) return sendError(res, 'Insufficient permissions', 403);
    next();
  };
};

export const requireCoordinator = requireRole('COORDINATOR', 'ADMIN');
export const requireAdmin = requireRole('ADMIN');

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
