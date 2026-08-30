import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/coordinator/ProtectedRoute';

import HomePage from './pages/public/HomePage';
import RegisterPage from './pages/public/RegisterPage';
import { CertificatesPage, VerifyCertPage } from './pages/public/CertificatesPage';
import CoordinatorLogin from './pages/auth/CoordinatorLogin';
import DashboardPage from './pages/coordinator/DashboardPage';
import { RegistrationsListPage, RegistrationDetailPage } from './pages/coordinator/RegistrationsPage';
import TournamentsPage from './pages/coordinator/TournamentsPage';
import { FacultyPage, StudentsPage } from './pages/coordinator/CoordinatorsPage';
import { RulesPage, GalleryPage, WinnersPage, AnnouncementsPage } from './pages/coordinator/ContentPages';
import { HomepageCMSPage, CertificatesManagePage, PaymentsPage, ReportsPage, AuditLogPage, UsersPage } from './pages/coordinator/ManagementPages';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/verify/:certificateId" element={<VerifyCertPage />} />
            <Route path="/coordinator/login" element={<CoordinatorLogin />} />
            <Route path="/coordinator" element={<Navigate to="/coordinator/dashboard" replace />} />
            <Route path="/coordinator/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/coordinator/registrations" element={<ProtectedRoute><RegistrationsListPage /></ProtectedRoute>} />
            <Route path="/coordinator/registrations/:id" element={<ProtectedRoute><RegistrationDetailPage /></ProtectedRoute>} />
            <Route path="/coordinator/teams" element={<ProtectedRoute><RegistrationsListPage /></ProtectedRoute>} />
            <Route path="/coordinator/tournaments" element={<ProtectedRoute><TournamentsPage /></ProtectedRoute>} />
            <Route path="/coordinator/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
            <Route path="/coordinator/faculty" element={<ProtectedRoute><FacultyPage /></ProtectedRoute>} />
            <Route path="/coordinator/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
            <Route path="/coordinator/rules" element={<ProtectedRoute><RulesPage /></ProtectedRoute>} />
            <Route path="/coordinator/gallery" element={<ProtectedRoute><GalleryPage /></ProtectedRoute>} />
            <Route path="/coordinator/winners" element={<ProtectedRoute><WinnersPage /></ProtectedRoute>} />
            <Route path="/coordinator/announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />
            <Route path="/coordinator/content" element={<ProtectedRoute><HomepageCMSPage /></ProtectedRoute>} />
            <Route path="/coordinator/certificates" element={<ProtectedRoute><CertificatesManagePage /></ProtectedRoute>} />
            <Route path="/coordinator/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/coordinator/audit" element={<ProtectedRoute><AuditLogPage /></ProtectedRoute>} />
            <Route path="/coordinator/users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
            <Route path="/coordinator/matches" element={<ProtectedRoute><TournamentsPage /></ProtectedRoute>} />
            <Route path="*" element={
              <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center px-4">
                <div>
                  <p className="text-8xl font-display font-black text-indigo-600/30 mb-4">404</p>
                  <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
                  <p className="text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn-primary inline-block">Return Home</a>
                </div>
              </div>
            } />
          </Routes>
          <Toaster position="top-right" toastOptions={{
            className: '!bg-slate-800 !text-white !border !border-slate-700 !shadow-xl',
            duration: 4000,
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }} />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
