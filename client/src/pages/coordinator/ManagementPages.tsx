import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Save, Download, Shield, BarChart3, CreditCard } from 'lucide-react';
import CoordinatorLayout from '../../components/coordinator/CoordinatorLayout';
import { Alert, Spinner, RegistrationBadge, PaymentBadge, StatCard, Modal } from '../../components/ui';
import { Registration, PaginatedResponse } from '../../types';
import api from '../../lib/api';

// ─── Homepage CMS ─────────────────────────────────────────────────
export function HomepageCMSPage() {
  const qc = useQueryClient();
  const [localContent, setLocalContent] = useState<Record<string, string> | null>(null);

  const { data: content, isLoading } = useQuery({
    queryKey: ['website-content'],
    queryFn: (): Promise<Record<string, string>> => api.get('/content').then(r => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.patch('/admin/content', data),
    onSuccess: () => {
      toast.success('Website content updated!');
      qc.invalidateQueries({ queryKey: ['website-content'] });
      qc.invalidateQueries({ queryKey: ['content'] });
    },
    onError: () => toast.error('Failed to save'),
  });

  // Sync remote content into local state once loaded
  if (content && !localContent) setLocalContent(content);
  const current = localContent || {};

  const fields = [
    { key: 'hero_title', label: 'Hero Title', hint: 'Main heading text (e.g. "SIET ESPORTS")' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', hint: 'Sub-heading (e.g. "Championship 2026")' },
    { key: 'hero_tagline', label: 'Hero Tagline', hint: 'Motto shown below subtitle' },
    { key: 'hero_description', label: 'Hero Description', multiline: true, hint: 'Intro paragraph in hero section' },
    { key: 'about_heading', label: 'About Heading' },
    { key: 'about_description', label: 'About Description', multiline: true },
    { key: 'mission', label: 'Mission Statement', multiline: true },
    { key: 'vision', label: 'Vision Statement', multiline: true },
    { key: 'contact_email', label: 'Contact Email' },
    { key: 'contact_phone', label: 'Contact Phone' },
    { key: 'contact_address', label: 'Contact Address', multiline: true },
    { key: 'stats_teams', label: 'Stats — Teams Count', hint: 'Displayed as "200+"' },
    { key: 'stats_participants', label: 'Stats — Participants Count' },
    { key: 'stats_events', label: 'Stats — Events Count' },
    { key: 'stats_matches', label: 'Stats — Matches Count' },
  ];

  const update = (key: string, val: string) => setLocalContent(prev => ({ ...prev!, [key]: val }));

  return (
    <CoordinatorLayout title="Homepage CMS">
      <div className="p-4 sm:p-6 space-y-5 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Homepage Content</h2>
            <p className="text-slate-400 text-sm mt-0.5">Changes appear instantly on the public website.</p>
          </div>
          <button
            onClick={() => localContent && saveMutation.mutate(localContent)}
            disabled={saveMutation.isPending || isLoading}
            className="flex items-center gap-2 btn-primary text-sm py-2"
          >
            {saveMutation.isPending ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>

        {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.key} className="coord-card">
                <label className="label">{field.label}</label>
                {field.hint && <p className="text-xs text-slate-500 mb-2">{field.hint}</p>}
                {field.multiline ? (
                  <textarea
                    value={current[field.key] || ''}
                    onChange={e => update(field.key, e.target.value)}
                    className="input min-h-[80px] text-sm"
                    rows={3}
                  />
                ) : (
                  <input
                    type="text"
                    value={current[field.key] || ''}
                    onChange={e => update(field.key, e.target.value)}
                    className="input text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </CoordinatorLayout>
  );
}

// ─── Certificates Page ────────────────────────────────────────────
export function CertificatesManagePage() {
  const [registrationId, setRegistrationId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: certs = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-certificates'],
    queryFn: () => api.get('/admin/certificates').then(r => r.data.data),
  });

  const generate = async () => {
    if (!registrationId.trim()) { toast.error('Enter a registration ID'); return; }
    setGenerating(true);
    try {
      await api.post('/admin/certificates/generate', { registrationId: registrationId.trim() });
      toast.success('Certificates generated!');
      refetch();
      setRegistrationId('');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to generate');
    } finally {
      setGenerating(false);
    }
  };

  const downloadCert = async (certId: string) => {
    setDownloading(certId);
    try {
      const res = await api.get(`/certificates/download/${certId}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = `${certId}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
    finally { setDownloading(null); }
  };

  const revoke = async (certId: string) => {
    try {
      await api.patch(`/admin/certificates/${certId}/revoke`);
      toast.success('Certificate revoked');
      refetch();
    } catch { toast.error('Failed to revoke'); }
  };

  const totalGenerated = certs.filter((c: { status: string }) => c.status === 'GENERATED').length;
  const totalRevoked = certs.filter((c: { status: string }) => c.status === 'REVOKED').length;

  return (
    <CoordinatorLayout title="Certificates">
      <div className="p-4 sm:p-6 space-y-5">
        <h2 className="text-xl font-bold text-white">Certificate Management</h2>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total" value={certs.length} icon={Shield} color="indigo" />
          <StatCard label="Generated" value={totalGenerated} icon={Shield} color="green" />
          <StatCard label="Revoked" value={totalRevoked} icon={Shield} color="red" />
        </div>

        {/* Generate */}
        <div className="coord-card">
          <h3 className="text-sm font-semibold text-white mb-3">Generate Certificates</h3>
          <p className="text-xs text-slate-500 mb-3">Enter the Registration ID of an approved team to generate certificates for all 4 players.</p>
          <div className="flex gap-3">
            <input
              value={registrationId}
              onChange={e => setRegistrationId(e.target.value)}
              className="input flex-1 font-mono text-sm"
              placeholder="Registration ID (e.g. clxxxx...)"
            />
            <button
              onClick={generate}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {generating ? <Spinner size="sm" /> : <Shield className="h-4 w-4" />}
              Generate
            </button>
          </div>
          <Alert type="info">
            <span className="text-xs">Certificates can only be generated for <strong>APPROVED</strong> registrations. Navigate to a registration and use the "Generate Certificates" button for the easiest workflow.</span>
          </Alert>
        </div>

        {/* List */}
        <div className="coord-card overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white">All Certificates</h3>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner size="lg" /></div>
          ) : !certs.length ? (
            <div className="text-center py-8 text-slate-500 text-sm">No certificates generated yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium">Certificate ID</th>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium hidden sm:table-cell">Issued To</th>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium hidden md:table-cell">Team</th>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {certs.map((cert: { certificateId: string; issuedTo: string; registration?: { teamName: string }; status: string; id: string }) => (
                    <tr key={cert.certificateId} className="hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 font-mono text-xs text-indigo-300">{cert.certificateId}</td>
                      <td className="px-4 py-2.5 text-slate-300 hidden sm:table-cell">{cert.issuedTo}</td>
                      <td className="px-4 py-2.5 text-slate-400 hidden md:table-cell">{cert.registration?.teamName}</td>
                      <td className="px-4 py-2.5">
                        <span className={`badge text-xs ${cert.status === 'GENERATED' ? 'bg-green-900/40 text-green-300 border border-green-700/30' : cert.status === 'REVOKED' ? 'bg-red-900/40 text-red-300' : 'bg-slate-700/40 text-slate-400'}`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2 justify-end">
                          {cert.status === 'GENERATED' && (
                            <>
                              <button onClick={() => downloadCert(cert.certificateId)} disabled={downloading === cert.certificateId}
                                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                {downloading === cert.certificateId ? <Spinner size="sm" /> : <Download className="h-3.5 w-3.5" />} Download
                              </button>
                              <button onClick={() => revoke(cert.certificateId)}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors">Revoke</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CoordinatorLayout>
  );
}

// ─── Payments Page ────────────────────────────────────────────────
export function PaymentsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedResponse<Registration>>({
    queryKey: ['admin-registrations-payments'],
    queryFn: () => api.get('/admin/registrations', { params: { limit: 50 } }).then(r => r.data.data),
    refetchInterval: 30_000,
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/payments/${id}/verify`),
    onSuccess: () => { toast.success('Payment verified!'); qc.invalidateQueries({ queryKey: ['admin-registrations-payments'] }); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/payments/${id}/reject`),
    onSuccess: () => { toast.success('Payment rejected'); qc.invalidateQueries({ queryKey: ['admin-registrations-payments'] }); },
  });

  const pendingPayments = data?.items.filter(r => r.payment?.status === 'PENDING') || [];
  const verifiedPayments = data?.items.filter(r => r.payment?.status === 'VERIFIED') || [];

  return (
    <CoordinatorLayout title="Payments">
      <div className="p-4 sm:p-6 space-y-5">
        <h2 className="text-xl font-bold text-white">Payment Verification</h2>

        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Pending Verification" value={pendingPayments.length} icon={CreditCard} color="yellow" />
          <StatCard label="Verified Payments" value={verifiedPayments.length} icon={CreditCard} color="green" />
        </div>

        <Alert type="info">
          Cash payments are collected in person. Verify here after receiving payment from the team.
        </Alert>

        <div className="coord-card overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">All Payments</h3>
            <span className="text-xs text-slate-500">{data?.total ?? 0} registrations</span>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner size="lg" /></div>
          ) : !data?.items.length ? (
            <div className="text-center py-8 text-slate-500 text-sm">No registrations yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium">Team</th>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium hidden sm:table-cell">Game</th>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium">Payment</th>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium hidden md:table-cell">Registration</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {data.items.map(reg => (
                    <tr key={reg.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{reg.teamName}</p>
                        <p className="text-xs text-slate-500 font-mono">{reg.teamLeaderMobile}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{reg.tournament?.game}</td>
                      <td className="px-4 py-3">
                        {reg.payment && <PaymentBadge status={reg.payment.status} />}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <RegistrationBadge status={reg.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          {reg.payment?.status === 'PENDING' && (
                            <button
                              onClick={() => verifyMutation.mutate(reg.id)}
                              disabled={verifyMutation.isPending}
                              className="flex items-center gap-1 text-xs px-2.5 py-1 bg-green-600/20 text-green-300 border border-green-700/30 rounded-lg hover:bg-green-600/30 transition-colors"
                            >
                              ✓ Verify Cash
                            </button>
                          )}
                          {reg.payment?.status === 'VERIFIED' && (
                            <span className="text-xs text-green-400">✓ Verified</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CoordinatorLayout>
  );
}

// ─── Reports ──────────────────────────────────────────────────────
export function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => api.get('/admin/reports').then(r => r.data.data),
  });

  return (
    <CoordinatorLayout title="Reports & Statistics">
      <div className="p-4 sm:p-6 space-y-5">
        <h2 className="text-xl font-bold text-white">Statistics & Reports</h2>

        {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ReportCard title="Registration Status" data={data?.byStatus} labelKey="status" countKey="_count" />
            <ReportCard title="Players by Year" data={data?.byYear} labelKey="year" countKey="_count" />
            <ReportCard title="Players by Department" data={data?.byDepartment} labelKey="department" countKey="_count" />
          </div>
        )}
      </div>
    </CoordinatorLayout>
  );
}

function ReportCard({ title, data, labelKey, countKey }: { title: string; data: Record<string, unknown>[]; labelKey: string; countKey: string }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => (d[countKey] as Record<string, number>)?.id || 0));
  return (
    <div className="coord-card">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-2.5">
        {data.map((item, i) => {
          const count = (item[countKey] as Record<string, number>)?.id || 0;
          const pct = max > 0 ? (count / max) * 100 : 0;
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">{String(item[labelKey]) || 'Unknown'}</span>
                <span className="text-slate-500 font-mono">{count}</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Audit Log ────────────────────────────────────────────────────
export function AuditLogPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => api.get('/admin/audit-logs').then(r => r.data.data),
  });

  return (
    <CoordinatorLayout title="Audit Log">
      <div className="p-4 sm:p-6 space-y-5">
        <h2 className="text-xl font-bold text-white">Audit Log</h2>
        <p className="text-slate-400 text-sm">All coordinator actions are tracked for accountability.</p>

        <div className="coord-card overflow-hidden p-0">
          {isLoading ? <div className="flex justify-center py-8"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50 border-b border-slate-800">
                  <tr>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium">Action</th>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium hidden sm:table-cell">Coordinator</th>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium hidden md:table-cell">Entity</th>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {logs.map((log: { id: string; action: string; user?: { name: string }; entity: string; entityId?: string; createdAt: string }) => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-mono text-indigo-300 bg-indigo-900/30 px-2 py-0.5 rounded">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 hidden sm:table-cell">{log.user?.name}</td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <span className="text-slate-400">{log.entity}</span>
                        {log.entityId && <span className="text-xs text-slate-600 ml-1 font-mono">{log.entityId.slice(0, 8)}…</span>}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs">{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </CoordinatorLayout>
  );
}

// ─── Users (Admin only) ───────────────────────────────────────────
export function UsersPage() {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'COORDINATOR' });
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/admin/users', data),
    onSuccess: () => { toast.success('User created!'); setModal(false); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed'),
  });

  return (
    <CoordinatorLayout title="User Management">
      <div className="p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Users</h2>
          <button onClick={() => { setForm({ email: '', name: '', password: '', role: 'COORDINATOR' }); setModal(true); }}
            className="btn-primary text-sm py-2 flex items-center gap-2">
            + Add User
          </button>
        </div>

        <div className="coord-card overflow-hidden p-0">
          {isLoading ? <div className="flex justify-center py-8"><Spinner size="lg" /></div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-800">
                <tr>
                  <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium">Name</th>
                  <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium">Email</th>
                  <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium">Role</th>
                  <th className="text-left text-xs text-slate-500 uppercase px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map((u: { id: string; name: string; email: string; role: string; isActive: boolean }) => (
                  <tr key={u.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${u.role === 'ADMIN' ? 'bg-purple-900/40 text-purple-300' : 'bg-indigo-900/40 text-indigo-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${u.isActive ? 'bg-green-900/40 text-green-300' : 'bg-slate-700/40 text-slate-500'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create User">
        <div className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input" placeholder="Min 8 characters" />
          </div>
          <div>
            <label className="label">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="select">
              <option value="COORDINATOR">Coordinator</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800">Cancel</button>
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="btn-primary text-sm py-2 flex items-center gap-2">
              {createMutation.isPending && <Spinner size="sm" />} Create User
            </button>
          </div>
        </div>
      </Modal>
    </CoordinatorLayout>
  );
}
