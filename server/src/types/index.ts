import { Request } from 'express';

export type Role = 'ADMIN' | 'COORDINATOR' | 'PARTICIPANT';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
  iat?: number;
  exp?: number;
}
