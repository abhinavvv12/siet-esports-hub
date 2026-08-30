import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../lib/prisma';

export const auditLog = (action: string, entity: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (req.user && body?.success) {
        prisma.auditLog.create({
          data: {
            userId: req.user!.id,
            action,
            entity,
            entityId: req.params.id || body?.data?.id,
            newValue: body?.data ? JSON.parse(JSON.stringify(body.data)) : undefined,
            ipAddress: req.ip,
          },
        }).catch(console.error);
      }
      return originalJson(body);
    };
    next();
  };
};
