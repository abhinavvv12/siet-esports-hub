import { Request, Response } from 'express';
import { sendSuccess, sendError, generateRegistrationCode, paginate } from '../utils';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types';

export const createRegistration = async (req: Request, res: Response) => {
  try {
    const { tournamentId, teamName, players } = req.body;

    // Validate tournament
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) return sendError(res, 'Tournament not found', 404);
    if (!tournament.registrationOpen) return sendError(res, 'Registrations are currently closed for this tournament');

    // Check registration deadline
    if (tournament.registrationDeadline && new Date() > tournament.registrationDeadline) {
      return sendError(res, 'Registration deadline has passed');
    }

    // Check max teams
    if (tournament.maxTeams) {
      const count = await prisma.registration.count({ where: { tournamentId, status: { not: 'CANCELLED' } } });
      if (count >= tournament.maxTeams) return sendError(res, 'Tournament is full');
    }

    // Validate players array
    if (!players || players.length !== 4) {
      return sendError(res, 'Exactly 4 players are required');
    }

    // Check duplicate team name
    const existingTeam = await prisma.registration.findFirst({
      where: { tournamentId, teamName: { equals: teamName, mode: 'insensitive' }, status: { not: 'CANCELLED' } },
    });
    if (existingTeam) return sendError(res, 'A team with this name already exists in this tournament');

    // Check duplicate players by roll number within tournament
    const rollNumbers = players.map((p: { rollNumber: string }) => p.rollNumber).filter(Boolean);
    const uniqueRolls = new Set(rollNumbers);
    if (uniqueRolls.size !== rollNumbers.length) {
      return sendError(res, 'Duplicate roll numbers found in your team');
    }

    const existingPlayers = await prisma.player.findMany({
      where: {
        rollNumber: { in: rollNumbers },
        registration: { tournamentId, status: { not: 'CANCELLED' } },
      },
    });
    if (existingPlayers.length > 0) {
      const names = existingPlayers.map((p) => p.rollNumber).join(', ');
      return sendError(res, `Players with roll numbers ${names} are already registered in this tournament`);
    }

    const leader = players.find((p: { isLeader?: boolean }) => p.isLeader) || players[0];
    const registrationCode = generateRegistrationCode();

    const registration = await prisma.registration.create({
      data: {
        registrationCode,
        tournamentId,
        teamName,
        teamLeaderEmail: leader.email || '',
        teamLeaderMobile: leader.mobile || '',
        players: {
          create: players.map((p: {
            fullName: string; rollNumber: string; classSection: string;
            year: string; department: string; email?: string; mobile?: string;
            isLeader?: boolean; playerNumber: number;
          }, i: number) => ({
            playerNumber: i + 1,
            fullName: p.fullName,
            rollNumber: p.rollNumber,
            classSection: p.classSection,
            year: p.year,
            department: p.department,
            email: p.email || null,
            mobile: p.mobile || null,
            isLeader: i === 0,
          })),
        },
        payment: { create: { status: 'PENDING' } },
      },
      include: { players: true, payment: true, tournament: { select: { name: true, game: true } } },
    });

    sendSuccess(res, registration, 'Registration submitted successfully! Your slot will be confirmed after cash payment verification.', 201);
  } catch (error) {
    console.error('Registration error:', error);
    sendError(res, 'Failed to submit registration', 500);
  }
};

export const getRegistration = async (req: Request, res: Response) => {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: req.params.id },
      include: {
        players: true,
        payment: true,
        tournament: { select: { name: true, game: true, venue: true } },
        certificates: { select: { id: true, certificateId: true, status: true, playerId: true, issuedTo: true } },
      },
    });
    if (!registration) return sendError(res, 'Registration not found', 404);

    // Don't expose sensitive admin data publicly
    const { approvedById, ...safeReg } = registration as typeof registration & { approvedById?: string };
    void approvedById;
    sendSuccess(res, safeReg);
  } catch {
    sendError(res, 'Failed to fetch registration', 500);
  }
};

export const getRegistrationByCode = async (req: Request, res: Response) => {
  try {
    const registration = await prisma.registration.findUnique({
      where: { registrationCode: req.params.code },
      include: {
        players: true,
        payment: { select: { status: true, amount: true } },
        tournament: { select: { name: true, game: true } },
      },
    });
    if (!registration) return sendError(res, 'Registration not found', 404);
    sendSuccess(res, registration);
  } catch {
    sendError(res, 'Failed to fetch registration', 500);
  }
};

// Admin: list all registrations
export const listRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, game, status, paymentStatus, search, tournamentId } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const { skip, take } = paginate(pageNum, limitNum);

    const where: Record<string, unknown> = {};
    if (tournamentId) where.tournamentId = tournamentId;
    if (status) where.status = status;
    if (game) where.tournament = { game };
    if (paymentStatus) where.payment = { status: paymentStatus };
    if (search) {
      where.OR = [
        { teamName: { contains: String(search), mode: 'insensitive' } },
        { teamLeaderMobile: { contains: String(search) } },
        { registrationCode: { contains: String(search), mode: 'insensitive' } },
        { players: { some: { fullName: { contains: String(search), mode: 'insensitive' } } } },
        { players: { some: { rollNumber: { contains: String(search), mode: 'insensitive' } } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        skip,
        take,
        orderBy: { submittedAt: 'desc' },
        include: {
          players: { where: { isLeader: true }, take: 1 },
          payment: true,
          tournament: { select: { name: true, game: true } },
          _count: { select: { certificates: true } },
        },
      }),
      prisma.registration.count({ where }),
    ]);

    sendSuccess(res, { items, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    console.error(error);
    sendError(res, 'Failed to list registrations', 500);
  }
};

export const getAdminRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: req.params.id },
      include: {
        players: true,
        payment: true,
        tournament: true,
        certificates: true,
        approvedBy: { select: { name: true, email: true } },
      },
    });
    if (!registration) return sendError(res, 'Registration not found', 404);
    sendSuccess(res, registration);
  } catch {
    sendError(res, 'Failed to fetch registration', 500);
  }
};

export const approveRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const reg = await prisma.registration.findUnique({ where: { id }, include: { payment: true } });
    if (!reg) return sendError(res, 'Registration not found', 404);
    if (reg.status !== 'PENDING_APPROVAL') return sendError(res, 'Registration is not in pending status');

    const updated = await prisma.registration.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedById: req.user!.id },
      include: { players: true, tournament: { select: { name: true, game: true } } },
    });

    // Log audit
    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'APPROVE_REGISTRATION', entity: 'Registration', entityId: id },
    });

    sendSuccess(res, updated, 'Registration approved');
  } catch {
    sendError(res, 'Failed to approve registration', 500);
  }
};

export const rejectRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const updated = await prisma.registration.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason || 'Rejected by coordinator' },
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'REJECT_REGISTRATION', entity: 'Registration', entityId: id, newValue: { reason } },
    });

    sendSuccess(res, updated, 'Registration rejected');
  } catch {
    sendError(res, 'Failed to reject registration', 500);
  }
};

export const cancelRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.registration.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    sendSuccess(res, updated, 'Registration cancelled');
  } catch {
    sendError(res, 'Failed to cancel registration', 500);
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, notes } = req.body;

    const payment = await prisma.payment.update({
      where: { registrationId: id },
      data: {
        status: 'VERIFIED',
        amount: amount ? parseFloat(amount) : null,
        verifiedById: req.user!.id,
        verifiedAt: new Date(),
        notes,
      },
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'VERIFY_PAYMENT', entity: 'Payment', entityId: payment.id },
    });

    sendSuccess(res, payment, 'Payment verified');
  } catch {
    sendError(res, 'Failed to verify payment', 500);
  }
};

export const rejectPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const payment = await prisma.payment.update({
      where: { registrationId: id },
      data: { status: 'REJECTED', notes, verifiedById: req.user!.id, verifiedAt: new Date() },
    });
    sendSuccess(res, payment, 'Payment rejected');
  } catch {
    sendError(res, 'Failed to reject payment', 500);
  }
};

export const getDashboardStats = async (_req: AuthRequest, res: Response) => {
  try {
    const [totalRegs, pending, approved, rejected, bgmi, freefire, totalPlayers, totalCerts] = await Promise.all([
      prisma.registration.count(),
      prisma.registration.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.registration.count({ where: { status: 'APPROVED' } }),
      prisma.registration.count({ where: { status: 'REJECTED' } }),
      prisma.registration.count({ where: { tournament: { game: 'BGMI' }, status: { not: 'CANCELLED' } } }),
      prisma.registration.count({ where: { tournament: { game: 'Free Fire MAX' }, status: { not: 'CANCELLED' } } }),
      prisma.player.count(),
      prisma.certificate.count({ where: { status: 'GENERATED' } }),
    ]);

    const recentRegistrations = await prisma.registration.findMany({
      take: 10,
      orderBy: { submittedAt: 'desc' },
      include: {
        players: { where: { isLeader: true }, take: 1 },
        tournament: { select: { game: true } },
        payment: { select: { status: true } },
      },
    });

    sendSuccess(res, {
      totalRegistrations: totalRegs,
      pendingRegistrations: pending,
      approvedTeams: approved,
      rejectedRegistrations: rejected,
      bgmiTeams: bgmi,
      freeFireTeams: freefire,
      totalPlayers,
      certificatesGenerated: totalCerts,
      recentRegistrations,
    });
  } catch (error) {
    console.error(error);
    sendError(res, 'Failed to fetch dashboard stats', 500);
  }
};

export const exportRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const { tournamentId, status } = req.query;
    const where: Record<string, unknown> = {};
    if (tournamentId) where.tournamentId = tournamentId;
    if (status) where.status = status;

    const registrations = await prisma.registration.findMany({
      where,
      include: { players: true, payment: true, tournament: { select: { name: true, game: true } } },
    });

    const rows = registrations.flatMap((reg) =>
      reg.players.map((p) => ({
        registrationCode: reg.registrationCode,
        teamName: reg.teamName,
        tournament: reg.tournament.name,
        game: reg.tournament.game,
        status: reg.status,
        paymentStatus: reg.payment?.status,
        playerName: p.fullName,
        rollNumber: p.rollNumber,
        department: p.department,
        year: p.year,
        classSection: p.classSection,
        mobile: p.mobile,
        email: p.email,
        isLeader: p.isLeader,
        submittedAt: reg.submittedAt.toISOString(),
      }))
    );

    const headers = Object.keys(rows[0] || {}).join(',');
    const csvRows = rows.map((row) => Object.values(row).map((v) => `"${v ?? ''}"`).join(','));
    const csv = [headers, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.csv');
    res.send(csv);
  } catch {
    sendError(res, 'Failed to export', 500);
  }
};
