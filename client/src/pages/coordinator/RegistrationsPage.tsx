import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, CheckCircle, XCircle, CreditCard, Download, RefreshCw, Award } from 'lucide-react';
import CoordinatorLayout from '../../components/coordinator/CoordinatorLayout';
import {
  RegistrationBadge, PaymentBadge, SearchInput, Pagination,
  ConfirmDialog, Modal, Alert, Spinner, EmptyState,
} from '../../components/ui';
import { Registration, PaginatedResponse } from '../../types';
import api from '../../lib/api';

export function RegistrationsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();

  const page = Number(searchParams.get('page') || 1);
  const status = searchParams.get('status') || '';
  const game = searchParams.get('game') || '';
  const search = searchParams.get('search') || '';

  const setParam = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.set('page', '1');
    setSearchParams(p);
  };

  const { data, isLoading } = useQuery<PaginatedResponse<Registration>>({
    queryKey: ['admin-registrations', page, status, game, search],
    queryFn: () => api.get('/admin/registrations', {
      params: { page, limit: 20, status: status || undefined, game: game || undefined, search: search || undefined },
    }).then(r => r.data.data),
    staleTime: 30_000,
  });

  const exportMutation = useMutation({
    mutationFn: () => api.get('/admin/export', { responseType: 'blob', params: { status: status || undefined } }),
    onSuccess: (res) => {
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = 'registrations.csv'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported!');
    },
  });

  return (
    <CoordinatorLayout title="Registrations">
      <div className="p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="text-xl font-bold text-white">Registrations</h2>
          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SearchInput
            value={search}
            onChange={v => setParam('search', v)}
            placeholder="Search team, player, code..."
          />
          <select
            value={status}
            onChange={e => setParam('status', e.target.value)}
            className="select"
          >
            <option value="">All Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={game}
            onChange={e => setParam('game', e.target.value)}
            className="select"
          >
            <option value="">All Games</option>
            <option value="BGMI">BGMI</option>
            <option value="Free Fire MAX">Free Fire MAX</option>
          </select>
        </div>

        {/* Table */}
        <div className="coord-card overflow-hidden p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : !data?.items?.length ? (
            <EmptyState icon={RefreshCw} title="No registrations found" description="Try adjusting your filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50 border-b border-slate-800">
                  <tr>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3 font-medium">Team</th>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3 font-medium hidden md:table-cell">Game</th>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3 font-medium hidden lg:table-cell">Leader</th>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3 font-medium">Status</th>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3 font-medium hidden sm:table-cell">Payment</th>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3 font-medium hidden xl:table-cell">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {data.items.map(reg => {
                    const leader = reg.players?.[0];
                    return (
                      <tr key={reg.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-white">{reg.teamName}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{reg.registrationCode}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-slate-300">{reg.tournament?.game}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div>
                            <p className="text-slate-300">{leader?.fullName}</p>
                            <p className="text-xs text-slate-500">{reg.teamLeaderMobile}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <RegistrationBadge status={reg.status} />
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {reg.payment && <PaymentBadge status={reg.payment.status} />}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden xl:table-cell">
                          {new Date(reg.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/coordinator/registrations/${reg.id}`}
                            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
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

        {data && (
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{data.total} total registration{data.total !== 1 ? 's' : ''}</span>
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onChange={p => setParam('page', String(p))}
            />
          </div>
        )}
      </div>
    </CoordinatorLayout>
  );
}

// ─── Registration Detail ──────────────────────────────────────────
export function RegistrationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [certLoading, setCertLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: reg, isLoading } = useQuery<Registration>({
    queryKey: ['admin-registration', id],
    queryFn: () => api.get(`/admin/registrations/${id}`).then(r => r.data.data),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-registration', id] });
    qc.invalidateQueries({ queryKey: ['admin-registrations'] });
    qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };

  const approveMutation = useMutation({
    mutationFn: () => api.patch(`/admin/registrations/${id}/approve`),
    onSuccess: () => { toast.success('Registration approved!'); invalidate(); },
    onError: () => toast.error('Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => api.patch(`/admin/registrations/${id}/reject`, { reason }),
    onSuccess: () => { toast.success('Registration rejected'); setRejectModal(false); invalidate(); },
    onError: () => toast.error('Failed to reject'),
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: (amount?: number) => api.patch(`/admin/payments/${id}/verify`, { amount }),
    onSuccess: () => { toast.success('Payment verified!'); invalidate(); },
    onError: () => toast.error('Failed to verify payment'),
  });

  const generateCerts = async () => {
    setCertLoading(true);
    try {
      await api.post('/admin/certificates/generate', { registrationId: id });
      toast.success('Certificates generated!');
      invalidate();
    } catch {
      toast.error('Failed to generate certificates');
    } finally {
      setCertLoading(false);
    }
  };

  const downloadCert = async (certId: string) => {
    setDownloading(certId);
    try {
      const res = await api.get(`/certificates/download/${certId}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `${certId}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading) return (
    <CoordinatorLayout title="Registration Detail">
      <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
    </CoordinatorLayout>
  );

  if (!reg) return (
    <CoordinatorLayout title="Not Found">
      <div className="p-6"><Alert type="error">Registration not found.</Alert></div>
    </CoordinatorLayout>
  );

  const isApproved = reg.status === 'APPROVED';
  const isPending = reg.status === 'PENDING_APPROVAL';
  const paymentPending = reg.payment?.status === 'PENDING';
  const paymentVerified = reg.payment?.status === 'VERIFIED';

  return (
    <CoordinatorLayout title="Registration Detail">
      <div className="p-4 sm:p-6 max-w-4xl space-y-5">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
          ← Back to Registrations
        </button>

        {/* Header */}
        <div className="coord-card flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-white mb-1">{reg.teamName}</h2>
            <p className="text-indigo-400 font-mono text-sm mb-2">{reg.registrationCode}</p>
            <div className="flex flex-wrap gap-2">
              <RegistrationBadge status={reg.status} />
              {reg.payment && <PaymentBadge status={reg.payment.status} />}
              <span className="badge bg-slate-700/50 text-slate-400">{reg.tournament?.game}</span>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            Submitted: {new Date(reg.submittedAt).toLocaleString('en-IN')}
            {reg.approvedAt && <p>Approved: {new Date(reg.approvedAt).toLocaleString('en-IN')}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="coord-card">
          <h3 className="text-sm font-semibold text-white mb-3">Actions</h3>
          <div className="flex flex-wrap gap-2">
            {isPending && (
              <>
                <button
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  {approveMutation.isPending ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => setRejectModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm font-medium rounded-lg transition-colors border border-red-500/30"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </>
            )}
            {paymentPending && (
              <button
                onClick={() => verifyPaymentMutation.mutate()}
                disabled={verifyPaymentMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" />
                {verifyPaymentMutation.isPending ? 'Verifying...' : 'Verify Payment'}
              </button>
            )}
            {isApproved && (
              <button
                onClick={generateCerts}
                disabled={certLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Award className="h-4 w-4" />
                {certLoading ? 'Generating...' : 'Generate Certificates'}
              </button>
            )}
          </div>

          {reg.rejectionReason && (
            <div className="mt-3">
              <Alert type="error">Rejection reason: {reg.rejectionReason}</Alert>
            </div>
          )}
        </div>

        {/* Players */}
        <div className="coord-card">
          <h3 className="text-sm font-semibold text-white mb-4">Team Players ({reg.players?.length})</h3>
          <div className="space-y-3">
            {reg.players?.map((player, i) => {
              const cert = reg.certificates?.find(c => c.playerId === player.id);
              return (
                <div key={player.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      player.isLeader ? 'bg-indigo-600/30 text-indigo-300' : 'bg-slate-700 text-slate-300'
                    }`}>
                      P{i + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{player.fullName}</p>
                        {player.isLeader && <span className="text-xs bg-indigo-600/20 text-indigo-300 px-1.5 py-0.5 rounded">Leader</span>}
                      </div>
                      <p className="text-xs text-slate-500">{player.rollNumber} • {player.department} • {player.year} • {player.classSection}</p>
                      {(player.email || player.mobile) && (
                        <p className="text-xs text-slate-500">{player.email} {player.mobile && `• ${player.mobile}`}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-12 sm:ml-0">
                    {cert?.status === 'GENERATED' ? (
                      <button
                        onClick={() => downloadCert(cert.certificateId)}
                        disabled={downloading === cert.certificateId}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg transition-colors border border-indigo-500/20"
                      >
                        {downloading === cert.certificateId ? <Spinner size="sm" /> : <Download className="h-3.5 w-3.5" />}
                        Download Cert
                      </button>
                    ) : isApproved ? (
                      <span className="text-xs text-slate-500">Cert not generated</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Info */}
        {reg.payment && (
          <div className="coord-card">
            <h3 className="text-sm font-semibold text-white mb-3">Payment Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">Status</p>
                <PaymentBadge status={reg.payment.status} />
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Method</p>
                <p className="text-slate-200">{reg.payment.method}</p>
              </div>
              {reg.payment.amount && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Amount</p>
                  <p className="text-slate-200">₹{reg.payment.amount}</p>
                </div>
              )}
              {paymentVerified && reg.payment.verifiedAt && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Verified At</p>
                  <p className="text-slate-200">{new Date(reg.payment.verifiedAt).toLocaleString('en-IN')}</p>
                </div>
              )}
              {reg.payment.notes && (
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-slate-500 text-xs mb-1">Notes</p>
                  <p className="text-slate-200">{reg.payment.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Reject Registration">
        <div className="space-y-4">
          <Alert type="warning">This will reject the team's registration. Provide a reason below.</Alert>
          <div>
            <label className="label">Rejection Reason</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="input min-h-[80px]"
              placeholder="e.g. Duplicate registration, invalid roll numbers..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setRejectModal(false)} className="px-4 py-2 text-sm text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => rejectMutation.mutate(rejectReason)}
              disabled={rejectMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {rejectMutation.isPending ? <Spinner size="sm" /> : null} Reject Registration
            </button>
          </div>
        </div>
      </Modal>
    </CoordinatorLayout>
  );
}
