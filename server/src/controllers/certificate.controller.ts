import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { sendSuccess, sendError, generateCertificateId } from '../utils';
import prisma from '../lib/prisma';
import { AuthRequest } from '../types';

export const verifyCertificateByMobile = async (req: Request, res: Response) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return sendError(res, 'Mobile number is required');

    const registration = await prisma.registration.findFirst({
      where: { teamLeaderMobile: mobile, status: 'APPROVED' },
      include: {
        players: true,
        tournament: { select: { name: true, game: true } },
        certificates: { select: { id: true, certificateId: true, status: true, playerId: true, issuedTo: true } },
      },
    });

    if (!registration) {
      return sendError(res, 'No approved registration found for this mobile number', 404);
    }

    sendSuccess(res, {
      teamName: registration.teamName,
      game: registration.tournament.game,
      tournamentName: registration.tournament.name,
      registrationCode: registration.registrationCode,
      players: registration.players.map((p) => ({
        id: p.id,
        name: p.fullName,
        isLeader: p.isLeader,
      })),
      certificates: registration.certificates,
      registrationId: registration.id,
    });
  } catch {
    sendError(res, 'Failed to verify', 500);
  }
};

export const verifyCertificateById = async (req: Request, res: Response) => {
  try {
    const { certificateId } = req.params;
    const cert = await prisma.certificate.findUnique({
      where: { certificateId },
      include: { registration: { select: { teamName: true, tournament: { select: { name: true, game: true } } } } },
    });

    if (!cert || cert.status !== 'GENERATED') {
      return sendError(res, 'Certificate not found or revoked', 404);
    }

    sendSuccess(res, {
      certificateId: cert.certificateId,
      issuedTo: cert.issuedTo,
      teamName: cert.registration.teamName,
      game: cert.game,
      tournament: cert.registration.tournament.name,
      achievement: cert.achievement,
      generatedAt: cert.generatedAt,
      isValid: true,
    });
  } catch {
    sendError(res, 'Failed to verify certificate', 500);
  }
};

export const generateCertificates = async (req: AuthRequest, res: Response) => {
  try {
    const { registrationId } = req.body;

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        players: true,
        tournament: true,
        certificates: true,
      },
    });

    if (!registration) return sendError(res, 'Registration not found', 404);
    if (registration.status !== 'APPROVED') return sendError(res, 'Can only generate certificates for approved registrations');

    // Count existing certs to get sequence
    const certCount = await prisma.certificate.count();

    const certificates = [];
    for (let i = 0; i < registration.players.length; i++) {
      const player = registration.players[i];
      const existing = registration.certificates.find((c) => c.playerId === player.id);

      if (existing && existing.status === 'GENERATED') {
        certificates.push(existing);
        continue;
      }

      const certId = generateCertificateId(certCount + i + 1);

      const cert = await prisma.certificate.upsert({
        where: existing ? { id: existing.id } : { certificateId: certId },
        update: {
          status: 'GENERATED',
          generatedAt: new Date(),
          generatedById: req.user!.id,
          certificateId: certId,
        },
        create: {
          certificateId: certId,
          registrationId,
          playerId: player.id,
          status: 'GENERATED',
          generatedAt: new Date(),
          generatedById: req.user!.id,
          issuedTo: player.fullName,
          teamName: registration.teamName,
          game: registration.tournament.game,
          achievement: 'Participation',
        },
      });
      certificates.push(cert);
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'GENERATE_CERTIFICATES',
        entity: 'Registration',
        entityId: registrationId,
      },
    });

    sendSuccess(res, certificates, 'Certificates generated successfully');
  } catch (error) {
    console.error(error);
    sendError(res, 'Failed to generate certificates', 500);
  }
};

export const downloadCertificate = async (req: Request, res: Response) => {
  try {
    const { certificateId } = req.params;

    const cert = await prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        registration: {
          include: { tournament: true },
        },
      },
    });

    if (!cert || cert.status !== 'GENERATED') {
      return sendError(res, 'Certificate not found', 404);
    }

    // Generate PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cert.certificateId}.pdf"`);
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Background
    doc.rect(0, 0, pageWidth, pageHeight).fill('#0a0a1a');

    // Border decorations
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40).lineWidth(2).stroke('#6366f1');
    doc.rect(25, 25, pageWidth - 50, pageHeight - 50).lineWidth(0.5).stroke('#4f46e5');

    // Top accent bar
    doc.rect(0, 0, pageWidth, 8).fill('#6366f1');
    doc.rect(0, pageHeight - 8, pageWidth, 8).fill('#6366f1');

    // Header
    doc.fontSize(11).fillColor('#6366f1').font('Helvetica-Bold')
      .text('SIDDHARTHA INSTITUTE OF ENGINEERING & TECHNOLOGY', 0, 50, { align: 'center' });

    doc.fontSize(9).fillColor('#a5b4fc').font('Helvetica')
      .text('Ibrahimpatnam, Hyderabad | Approved by AICTE | Affiliated to JNTU Hyderabad', 0, 68, { align: 'center' });

    // Decorative line
    doc.moveTo(80, 90).lineTo(pageWidth - 80, 90).lineWidth(1).stroke('#6366f1');

    // Club name
    doc.fontSize(14).fillColor('#818cf8').font('Helvetica-Bold')
      .text('SIET ESPORTS CLUB', 0, 98, { align: 'center' });

    // Certificate title
    doc.fontSize(28).fillColor('#ffffff').font('Helvetica-Bold')
      .text('CERTIFICATE OF PARTICIPATION', 0, 130, { align: 'center' });

    doc.fontSize(10).fillColor('#94a3b8').font('Helvetica')
      .text('This is to certify that', 0, 172, { align: 'center' });

    // Recipient name
    doc.fontSize(32).fillColor('#6366f1').font('Helvetica-Bold')
      .text(cert.issuedTo.toUpperCase(), 0, 192, { align: 'center' });

    // Decorative underline
    const nameWidth = doc.widthOfString(cert.issuedTo.toUpperCase()) * 1.1;
    const nameX = (pageWidth - nameWidth) / 2;
    doc.moveTo(nameX, 235).lineTo(nameX + nameWidth, 235).lineWidth(1.5).stroke('#6366f1');

    doc.fontSize(11).fillColor('#94a3b8').font('Helvetica')
      .text('representing team', 0, 248, { align: 'center' });

    doc.fontSize(20).fillColor('#e2e8f0').font('Helvetica-Bold')
      .text(`"${cert.teamName}"`, 0, 264, { align: 'center' });

    doc.fontSize(11).fillColor('#94a3b8').font('Helvetica')
      .text(`has participated in the`, 0, 295, { align: 'center' });

    doc.fontSize(16).fillColor('#818cf8').font('Helvetica-Bold')
      .text(`SIET Esports Championship 2026`, 0, 312, { align: 'center' });

    doc.fontSize(13).fillColor('#6366f1').font('Helvetica-Bold')
      .text(`[ ${cert.game} ]`, 0, 334, { align: 'center' });

    // Bottom section
    doc.moveTo(80, 360).lineTo(pageWidth - 80, 360).lineWidth(0.5).stroke('#4f46e5');

    // Certificate ID and date
    const bottomY = 375;
    doc.fontSize(8).fillColor('#64748b').font('Helvetica')
      .text(`Certificate ID: ${cert.certificateId}`, 80, bottomY);

    doc.fontSize(8).fillColor('#64748b').font('Helvetica')
      .text(`Issue Date: ${cert.generatedAt ? new Date(cert.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}`,
        pageWidth / 2 - 60, bottomY);

    // Signature areas
    const sigY = 380;
    // Faculty coordinator signature
    doc.fontSize(9).fillColor('#94a3b8').font('Helvetica')
      .text('Dr. A. Ramesh Kumar', 80, sigY + 20, { width: 150, align: 'center' });
    doc.moveTo(80, sigY + 18).lineTo(230, sigY + 18).lineWidth(0.5).stroke('#4f46e5');
    doc.fontSize(7).fillColor('#64748b')
      .text('Faculty Coordinator', 80, sigY + 30, { width: 150, align: 'center' });

    // Club coordinator signature
    doc.fontSize(9).fillColor('#94a3b8').font('Helvetica')
      .text('SIET Esports Club', pageWidth - 230, sigY + 20, { width: 150, align: 'center' });
    doc.moveTo(pageWidth - 230, sigY + 18).lineTo(pageWidth - 80, sigY + 18).lineWidth(0.5).stroke('#4f46e5');
    doc.fontSize(7).fillColor('#64748b')
      .text('Organising Committee', pageWidth - 230, sigY + 30, { width: 150, align: 'center' });

    // Verify QR placeholder text
    doc.fontSize(7).fillColor('#64748b').font('Helvetica')
      .text(`Verify at: siet-esports.in/verify/${cert.certificateId}`, 0, sigY + 45, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error(error);
    sendError(res, 'Failed to generate certificate PDF', 500);
  }
};

export const revokeCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { certificateId } = req.params;
    const cert = await prisma.certificate.update({
      where: { certificateId },
      data: { status: 'REVOKED', revokedAt: new Date() },
    });
    sendSuccess(res, cert, 'Certificate revoked');
  } catch {
    sendError(res, 'Failed to revoke certificate', 500);
  }
};

export const listCertificates = async (req: AuthRequest, res: Response) => {
  try {
    const { registrationId } = req.query;
    const where = registrationId ? { registrationId: String(registrationId) } : {};
    const certs = await prisma.certificate.findMany({
      where,
      include: { registration: { select: { teamName: true } } },
      orderBy: { generatedAt: 'desc' },
    });
    sendSuccess(res, certs);
  } catch {
    sendError(res, 'Failed to list certificates', 500);
  }
};
