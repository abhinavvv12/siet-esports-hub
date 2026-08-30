import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils';
import { generateToken } from '../middleware/auth';
import prisma from '../lib/prisma';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required');
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || !user.isActive) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, profilePhoto: user.profilePhoto },
      token,
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Login failed', 500);
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('token');
  sendSuccess(res, null, 'Logged out successfully');
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, profilePhoto: true, createdAt: true },
    });
    if (!user) return sendError(res, 'User not found', 404);
    sendSuccess(res, user);
  } catch {
    sendError(res, 'Failed to get user', 500);
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return sendError(res, 'User not found', 404);

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return sendError(res, 'Current password is incorrect');

    if (newPassword.length < 8) return sendError(res, 'Password must be at least 8 characters');

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    sendSuccess(res, null, 'Password changed successfully');
  } catch {
    sendError(res, 'Failed to change password', 500);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name },
      select: { id: true, email: true, name: true, role: true, profilePhoto: true },
    });
    sendSuccess(res, user, 'Profile updated');
  } catch {
    sendError(res, 'Failed to update profile', 500);
  }
};
