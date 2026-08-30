import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types';

// Faculty Coordinators
export const getFacultyCoordinators = async (_req: Request, res: Response) => {
  try {
    const faculty = await prisma.facultyCoordinator.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    sendSuccess(res, faculty);
  } catch { sendError(res, 'Failed to fetch faculty coordinators', 500); }
};

export const createFacultyCoordinator = async (req: AuthRequest, res: Response) => {
  try {
    const faculty = await prisma.facultyCoordinator.create({ data: req.body });
    sendSuccess(res, faculty, 'Faculty coordinator created', 201);
  } catch { sendError(res, 'Failed to create', 500); }
};

export const updateFacultyCoordinator = async (req: AuthRequest, res: Response) => {
  try {
    const faculty = await prisma.facultyCoordinator.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, faculty, 'Updated');
  } catch { sendError(res, 'Failed to update', 500); }
};

export const deleteFacultyCoordinator = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.facultyCoordinator.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Deleted');
  } catch { sendError(res, 'Failed to delete', 500); }
};

// Student Coordinators
export const getStudentCoordinators = async (_req: Request, res: Response) => {
  try {
    const students = await prisma.studentCoordinator.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    sendSuccess(res, students);
  } catch { sendError(res, 'Failed to fetch student coordinators', 500); }
};

export const createStudentCoordinator = async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.studentCoordinator.create({ data: req.body });
    sendSuccess(res, student, 'Created', 201);
  } catch { sendError(res, 'Failed to create', 500); }
};

export const updateStudentCoordinator = async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.studentCoordinator.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, student, 'Updated');
  } catch { sendError(res, 'Failed to update', 500); }
};

export const deleteStudentCoordinator = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.studentCoordinator.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Deleted');
  } catch { sendError(res, 'Failed to delete', 500); }
};

// Tournament Rules
export const getRules = async (_req: Request, res: Response) => {
  try {
    const rules = await prisma.tournamentRule.findMany({
      where: { isActive: true },
      orderBy: { ruleNumber: 'asc' },
    });
    sendSuccess(res, rules);
  } catch { sendError(res, 'Failed to fetch rules', 500); }
};

export const createRule = async (req: AuthRequest, res: Response) => {
  try {
    const rule = await prisma.tournamentRule.create({ data: req.body });
    sendSuccess(res, rule, 'Rule created', 201);
  } catch { sendError(res, 'Failed to create rule', 500); }
};

export const updateRule = async (req: AuthRequest, res: Response) => {
  try {
    const rule = await prisma.tournamentRule.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, rule, 'Rule updated');
  } catch { sendError(res, 'Failed to update rule', 500); }
};

export const deleteRule = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.tournamentRule.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Rule deleted');
  } catch { sendError(res, 'Failed to delete rule', 500); }
};

// Website Content (CMS)
export const getWebsiteContent = async (_req: Request, res: Response) => {
  try {
    const content = await prisma.websiteContent.findMany();
    const map: Record<string, string> = {};
    content.forEach((c) => { map[c.key] = c.value; });
    sendSuccess(res, map);
  } catch { sendError(res, 'Failed to fetch content', 500); }
};

export const updateWebsiteContent = async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body as Record<string, string>;
    const ops = Object.entries(updates).map(([key, value]) =>
      prisma.websiteContent.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );
    await Promise.all(ops);
    sendSuccess(res, null, 'Content updated');
  } catch { sendError(res, 'Failed to update content', 500); }
};

// Gallery
export const getGallery = async (req: Request, res: Response) => {
  try {
    const { tournamentId, featured } = req.query;
    const where: Record<string, unknown> = {};
    if (tournamentId) where.tournamentId = tournamentId;
    if (featured === 'true') where.isFeatured = true;

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
    sendSuccess(res, images);
  } catch { sendError(res, 'Failed to fetch gallery', 500); }
};

export const createGalleryImage = async (req: AuthRequest, res: Response) => {
  try {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) return sendError(res, 'Image file required');

    const url = `/uploads/${file.filename}`;
    const image = await prisma.galleryImage.create({
      data: {
        filename: file.filename,
        url,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        tournamentId: req.body.tournamentId || null,
        isFeatured: req.body.isFeatured === 'true',
      },
    });
    sendSuccess(res, image, 'Image uploaded', 201);
  } catch { sendError(res, 'Failed to upload image', 500); }
};

export const updateGalleryImage = async (req: AuthRequest, res: Response) => {
  try {
    const image = await prisma.galleryImage.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, image, 'Updated');
  } catch { sendError(res, 'Failed to update', 500); }
};

export const deleteGalleryImage = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.galleryImage.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Image deleted');
  } catch { sendError(res, 'Failed to delete', 500); }
};

// Winners
export const getWinners = async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.query;
    const where = tournamentId ? { tournamentId: String(tournamentId) } : {};
    const winners = await prisma.winner.findMany({ where, include: { tournament: { select: { name: true } } } });
    sendSuccess(res, winners);
  } catch { sendError(res, 'Failed to fetch winners', 500); }
};

export const createWinner = async (req: AuthRequest, res: Response) => {
  try {
    const winner = await prisma.winner.create({ data: req.body });
    sendSuccess(res, winner, 'Winner added', 201);
  } catch { sendError(res, 'Failed to add winner', 500); }
};

export const updateWinner = async (req: AuthRequest, res: Response) => {
  try {
    const winner = await prisma.winner.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, winner, 'Updated');
  } catch { sendError(res, 'Failed to update', 500); }
};

export const deleteWinner = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.winner.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Winner deleted');
  } catch { sendError(res, 'Failed to delete', 500); }
};

// Announcements
export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const announcements = await prisma.announcement.findMany({
      where: {
        status: 'PUBLISHED',
        AND: [
          { OR: [{ expiryDate: null }, { expiryDate: { gte: now } }] },
          { OR: [{ publishDate: null }, { publishDate: { lte: now } }] },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, announcements);
  } catch { sendError(res, 'Failed to fetch announcements', 500); }
};

export const getAllAnnouncements = async (req: AuthRequest, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    sendSuccess(res, announcements);
  } catch { sendError(res, 'Failed to fetch', 500); }
};

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const ann = await prisma.announcement.create({ data: req.body });
    sendSuccess(res, ann, 'Announcement created', 201);
  } catch { sendError(res, 'Failed to create', 500); }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const ann = await prisma.announcement.update({ where: { id: req.params.id }, data: req.body });
    sendSuccess(res, ann, 'Updated');
  } catch { sendError(res, 'Failed to update', 500); }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Deleted');
  } catch { sendError(res, 'Failed to delete', 500); }
};

// Audit Logs
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
    sendSuccess(res, logs);
  } catch { sendError(res, 'Failed to fetch logs', 500); }
};

// Users management (admin only)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, users);
  } catch { sendError(res, 'Failed to fetch users', 500); }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const bcrypt = await import('bcryptjs');
    const { email, password, name, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return sendError(res, 'Email already exists');

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role },
      select: { id: true, email: true, name: true, role: true },
    });
    sendSuccess(res, user, 'User created', 201);
  } catch { sendError(res, 'Failed to create user', 500); }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, isActive } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { name, role, isActive },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    sendSuccess(res, user, 'User updated');
  } catch { sendError(res, 'Failed to update user', 500); }
};

// Report stats
export const getReportStats = async (req: AuthRequest, res: Response) => {
  try {
    const [byDept, byYear, byGame, byStatus] = await Promise.all([
      prisma.player.groupBy({ by: ['department'], _count: { id: true } }),
      prisma.player.groupBy({ by: ['year'], _count: { id: true } }),
      prisma.registration.groupBy({ by: ['tournamentId'], _count: { id: true } }),
      prisma.registration.groupBy({ by: ['status'], _count: { id: true } }),
    ]);

    sendSuccess(res, {
      byDepartment: byDept,
      byYear: byYear,
      byTournament: byGame,
      byStatus: byStatus,
    });
  } catch { sendError(res, 'Failed to get report', 500); }
};
