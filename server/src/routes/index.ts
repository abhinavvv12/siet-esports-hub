import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, requireCoordinator, requireAdmin } from '../middleware/auth';

import * as auth from '../controllers/auth.controller';
import * as tournament from '../controllers/tournament.controller';
import * as registration from '../controllers/registration.controller';
import * as certificate from '../controllers/certificate.controller';
import * as content from '../controllers/content.controller';

const router = Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    require('fs').mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only images allowed'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Auth ─────────────────────────────────────────────────────────
router.post('/auth/login', auth.login);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', authenticate, auth.me);
router.patch('/auth/password', authenticate, auth.changePassword);
router.patch('/auth/profile', authenticate, auth.updateProfile);

// ─── Public content ───────────────────────────────────────────────
router.get('/tournaments/public', tournament.getPublicTournaments);
router.get('/tournaments/:id/public', tournament.getTournament);
router.get('/content', content.getWebsiteContent);
router.get('/faculty', content.getFacultyCoordinators);
router.get('/students', content.getStudentCoordinators);
router.get('/rules', content.getRules);
router.get('/gallery', content.getGallery);
router.get('/winners', content.getWinners);
router.get('/announcements', content.getAnnouncements);

// ─── Registrations (public submission) ────────────────────────────
router.post('/registrations', registration.createRegistration);
router.get('/registrations/:id', registration.getRegistration);
router.get('/registrations/code/:code', registration.getRegistrationByCode);

// ─── Certificates (public) ────────────────────────────────────────
router.post('/certificates/verify-mobile', certificate.verifyCertificateByMobile);
router.get('/certificates/verify/:certificateId', certificate.verifyCertificateById);
router.get('/certificates/download/:certificateId', certificate.downloadCertificate);

// ─── Coordinator / Admin ──────────────────────────────────────────
router.use(authenticate, requireCoordinator);

// Tournaments
router.get('/admin/tournaments', tournament.getTournaments);
router.post('/admin/tournaments', tournament.createTournament);
router.patch('/admin/tournaments/:id', tournament.updateTournament);
router.delete('/admin/tournaments/:id', tournament.deleteTournament);
router.get('/admin/tournaments/:id/stats', tournament.getTournamentStats);

// Registrations management
router.get('/admin/registrations', registration.listRegistrations);
router.get('/admin/registrations/:id', registration.getAdminRegistration);
router.patch('/admin/registrations/:id/approve', registration.approveRegistration);
router.patch('/admin/registrations/:id/reject', registration.rejectRegistration);
router.patch('/admin/registrations/:id/cancel', registration.cancelRegistration);
router.patch('/admin/payments/:id/verify', registration.verifyPayment);
router.patch('/admin/payments/:id/reject', registration.rejectPayment);
router.get('/admin/dashboard', registration.getDashboardStats);
router.get('/admin/export', registration.exportRegistrations);

// Certificates
router.post('/admin/certificates/generate', certificate.generateCertificates);
router.get('/admin/certificates', certificate.listCertificates);
router.patch('/admin/certificates/:certificateId/revoke', certificate.revokeCertificate);

// Content management
router.patch('/admin/content', content.updateWebsiteContent);
router.post('/admin/faculty', content.createFacultyCoordinator);
router.patch('/admin/faculty/:id', content.updateFacultyCoordinator);
router.delete('/admin/faculty/:id', content.deleteFacultyCoordinator);
router.post('/admin/students', content.createStudentCoordinator);
router.patch('/admin/students/:id', content.updateStudentCoordinator);
router.delete('/admin/students/:id', content.deleteStudentCoordinator);
router.post('/admin/rules', content.createRule);
router.patch('/admin/rules/:id', content.updateRule);
router.delete('/admin/rules/:id', content.deleteRule);
router.post('/admin/gallery', upload.single('image'), content.createGalleryImage);
router.patch('/admin/gallery/:id', content.updateGalleryImage);
router.delete('/admin/gallery/:id', content.deleteGalleryImage);
router.post('/admin/winners', content.createWinner);
router.patch('/admin/winners/:id', content.updateWinner);
router.delete('/admin/winners/:id', content.deleteWinner);
router.get('/admin/announcements', content.getAllAnnouncements);
router.post('/admin/announcements', content.createAnnouncement);
router.patch('/admin/announcements/:id', content.updateAnnouncement);
router.delete('/admin/announcements/:id', content.deleteAnnouncement);
router.get('/admin/audit-logs', content.getAuditLogs);
router.get('/admin/reports', content.getReportStats);

// Admin only
router.use(requireAdmin);
router.get('/admin/users', content.getUsers);
router.post('/admin/users', content.createUser);
router.patch('/admin/users/:id', content.updateUser);

export default router;
