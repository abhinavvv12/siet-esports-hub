import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, FileText, Trophy, Shield, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import CoordinatorLayout from '../../components/coordinator/CoordinatorLayout';
import { StatCard, RegistrationBadge, PaymentBadge, Spinner } from '../../components/ui';
import { DashboardStats } from '../../types';
import api from '../../lib/api';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data.data),
    refetchInterval: 30_000,
  });

  return (
    <CoordinatorLayout title="Dashboard">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-5">
          <h2 className="text-xl font-display font-bold text-white mb-1">SIET Esports Coordinator Hub</h2>
          <p className="text-slate-400 text-sm">Manage tournaments, registrations, payments, and content from here.</p>
        </div>

        {/* Stats grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(8).fill(null).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Registrations" value={stats?.totalRegistrations ?? 0} icon={FileText} color="indigo" />
            <StatCard label="Pending Approval" value={stats?.pendingRegistrations ?? 0} icon={Clock} color="yellow"
              sub={stats?.pendingRegistrations ? 'Needs attention' : 'All clear'} />
            <StatCard label="Approved Teams" value={stats?.approvedTeams ?? 0} icon={CheckCircle} color="green" />
            <StatCard label="Rejected" value={stats?.rejectedRegistrations ?? 0} icon={XCircle} color="red" />
            <StatCard label="BGMI Teams" value={stats?.bgmiTeams ?? 0} icon={Trophy} color="purple" />
            <StatCard label="Free Fire MAX Teams" value={stats?.freeFireTeams ?? 0} icon={Trophy} color="blue" />
            <StatCard label="Total Players" value={stats?.totalPlayers ?? 0} icon={Users} color="indigo" />
            <StatCard label="Certificates Issued" value={stats?.certificatesGenerated ?? 0} icon={Shield} color="green" />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/coordinator/registrations?status=PENDING_APPROVAL', label: 'Review Pending', icon: Clock, color: 'yellow' },
            { href: '/coordinator/payments', label: 'Verify Payments', icon: CreditCard, color: 'green' },
            { href: '/coordinator/certificates', label: 'Certificates', icon: Shield, color: 'indigo' },
            { href: '/coordinator/tournaments', label: 'Tournaments', icon: Trophy, color: 'purple' },
          ].map(action => (
            <Link key={action.href} to={action.href}
              className="coord-card hover:border-slate-700 transition-colors flex flex-col items-center gap-2 py-4 text-center">
              <action.icon className="h-5 w-5 text-indigo-400" />
              <span className="text-xs font-medium text-slate-300">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent Registrations */}
        <div className="coord-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Recent Registrations</h3>
            <Link to="/coordinator/registrations" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
            </div>
          ) : !stats?.recentRegistrations?.length ? (
            <div className="text-center py-8 text-slate-500 text-sm">No registrations yet</div>
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-5 py-2.5 font-medium">Team</th>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-2.5 font-medium hidden sm:table-cell">Game</th>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-2.5 font-medium hidden md:table-cell">Leader</th>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-2.5 font-medium">Status</th>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-2.5 font-medium hidden lg:table-cell">Payment</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {stats.recentRegistrations.map((reg) => {
                    const leader = reg.players?.[0];
                    return (
                      <tr key={reg.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3">
                          <div>
                            <p className="font-medium text-white text-sm">{reg.teamName}</p>
                            <p className="text-xs text-slate-500 font-mono">{reg.registrationCode}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-slate-300 text-sm">{reg.tournament?.game}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-slate-400 text-sm">{leader?.fullName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <RegistrationBadge status={reg.status} />
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {reg.payment && <PaymentBadge status={reg.payment.status} />}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/coordinator/registrations/${reg.id}`}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CoordinatorLayout>
  );
}
