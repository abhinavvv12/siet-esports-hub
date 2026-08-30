import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, message?: string, status = 200) => {
  res.status(status).json({ success: true, data, message });
};

export const sendError = (res: Response, message: string, status = 400, errors?: Record<string, string[]>) => {
  res.status(status).json({ success: false, message, errors });
};

export const generateRegistrationCode = (): string => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SIET-${year}-${random}`;
};

export const generateCertificateId = (sequence: number): string => {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(6, '0');
  return `SIET-ESPORTS-${year}-${padded}`;
};

export const sanitizeString = (str: string): string => {
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
};

export const paginate = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
};
