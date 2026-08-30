import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types';

export const getTournaments = async (_req: Request, res: Response) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { registrations: true } },
      },
    });
    sendSuccess(res, tournaments);
  } catch {
    sendError(res, 'Failed to fetch tournaments', 500);
  }
};

export const getPublicTournaments = async (_req: Request, res: Response) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: { status: { not: 'DRAFT' } },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true, name: true, game: true, description: true,
        bannerImage: true, logo: true, startDate: true, endDate: true,
        registrationStart: true, registrationDeadline: true,
        venue: true, entryFee: true, maxTeams: true, teamSize: true,
        prizePool: true, status: true, registrationOpen: true,
        _count: { select: { registrations: true } },
      },
    });
    sendSuccess(res, tournaments);
  } catch {
    sendError(res, 'Failed to fetch tournaments', 500);
  }
};

export const getTournament = async (req: Request, res: Response) => {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: req.params.id },
      include: {
        stages: { orderBy: { order: 'asc' } },
        rules: { where: { isActive: true }, orderBy: { ruleNumber: 'asc' } },
        _count: { select: { registrations: true } },
      },
    });
    if (!tournament) return sendError(res, 'Tournament not found', 404);
    sendSuccess(res, tournament);
  } catch {
    sendError(res, 'Failed to fetch tournament', 500);
  }
};

export const createTournament = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const tournament = await prisma.tournament.create({ data });
    sendSuccess(res, tournament, 'Tournament created', 201);
  } catch (error) {
    console.error(error);
    sendError(res, 'Failed to create tournament', 500);
  }
};

export const updateTournament = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tournament = await prisma.tournament.update({
      where: { id },
      data: req.body,
    });
    sendSuccess(res, tournament, 'Tournament updated');
  } catch {
    sendError(res, 'Failed to update tournament', 500);
  }
};

export const deleteTournament = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const count = await prisma.registration.count({ where: { tournamentId: id } });
    if (count > 0) {
      // Soft delete by cancelling
      await prisma.tournament.update({ where: { id }, data: { status: 'CANCELLED' } });
      return sendSuccess(res, null, `Tournament archived. ${count} registrations preserved.`);
    }
    await prisma.tournament.delete({ where: { id } });
    sendSuccess(res, null, 'Tournament deleted');
  } catch {
    sendError(res, 'Failed to delete tournament', 500);
  }
};

export const getTournamentStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [total, approved, pending, rejected] = await Promise.all([
      prisma.registration.count({ where: { tournamentId: id } }),
      prisma.registration.count({ where: { tournamentId: id, status: 'APPROVED' } }),
      prisma.registration.count({ where: { tournamentId: id, status: 'PENDING_APPROVAL' } }),
      prisma.registration.count({ where: { tournamentId: id, status: 'REJECTED' } }),
    ]);
    sendSuccess(res, { total, approved, pending, rejected });
  } catch {
    sendError(res, 'Failed to get stats', 500);
  }
};
