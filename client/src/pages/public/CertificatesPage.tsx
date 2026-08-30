import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Shield, Download, CheckCircle, XCircle, Award } from 'lucide-react';
import api from '../../lib/api';
import PublicLayout from '../../components/layout/PublicLayout';
import { Alert, FormError, Spinner, RegistrationBadge } from '../../components/ui';

const schema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
});

type FormData = z.infer<typeof schema>;

interface CertVerifyResult {
  teamName: string;
  game: string;
  tournamentName: string;
  registrationCode: string;
  players: { id: string; name: string; isLeader: boolean }[];
  certificates: { id: string; certificateId: string; status: string; playerId: string; issuedTo: string }[];
  registrationId: string;
}

export function CertificatesPage() {
  const [result, setResult] = useState<CertVerifyResult | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setResult(null);
    try {
      const res = await api.post('/certificates/verify-mobile', { mobile: data.mobile });
      setResult(res.data.data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'No registration found');
    }
  };

  const downloadCert = async (certId: string) => {
    setDownloading(certId);
    try {
      const res = await api.get(`/certificates/download/${certId}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${certId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!');
    } catch {
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(null);
    }
  };

  const getCert = (playerId: string) =>
    result?.certificates.find(c => c.playerId === playerId);

  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-3">Participation Certificate</p>
            <h1 className="text-4xl font-display font-bold text-white mb-3">
              Certificate <span className="text-gradient">Verification</span>
            </h1>
            <p className="text-slate-400 text-sm">Enter the team leader's registered mobile number to verify and download certificates.</p>
          </div>

          {/* Verify Form */}
          <div className="card p-6 mb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Team Leader's Mobile Number</label>
                <input
                  {...register('mobile')}
                  type="tel"
                  className="input text-lg text-center tracking-widest"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
                <FormError message={errors.mobile?.message} />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2">
                {isSubmitting ? <><Spinner size="sm" /> Verifying...</> : <><Shield className="h-4 w-4" /> Verify Participation</>}
              </button>
            </form>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          {/* Results */}
          {result && (
            <div className="card p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">{result.teamName}</h2>
                  <p className="text-indigo-400 font-mono text-sm">{result.game}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{result.tournamentName}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <RegistrationBadge status="APPROVED" />
                  <span className="text-xs font-mono text-slate-500">{result.registrationCode}</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-5">
                <p className="text-sm font-medium text-slate-300 mb-3">Player Certificates</p>
                <div className="space-y-3">
                  {result.players.map(player => {
                    const cert = getCert(player.id);
                    const isGenerated = cert?.status === 'GENERATED';
                    return (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isGenerated ? 'bg-green-600/20 text-green-400' : 'bg-slate-700 text-slate-500'
                          }`}>
                            {player.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{player.name}</p>
                            {player.isLeader && <p className="text-xs text-indigo-400">Team Leader</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isGenerated ? (
                            <>
                              <span className="hidden sm:flex items-center gap-1 text-xs text-green-400">
                                <CheckCircle className="h-3.5 w-3.5" /> Available
                              </span>
                              <button
                                onClick={() => downloadCert(cert!.certificateId)}
                                disabled={downloading === cert!.certificateId}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                              >
                                {downloading === cert!.certificateId ? <Spinner size="sm" /> : <Download className="h-3.5 w-3.5" />}
                                Download
                              </button>
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <XCircle className="h-3.5 w-3.5" /> Not yet generated
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {result.certificates.length === 0 && (
                <Alert type="info">
                  Certificates have not been generated yet. They will be available once the coordinator generates them. Check back later.
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

// ─── Public certificate verification by ID ────────────────────────
export function VerifyCertPage() {
  const { certificateId } = useParams<{ certificateId: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['verify-cert', certificateId],
    queryFn: () => api.get(`/certificates/verify/${certificateId}`).then(r => r.data.data),
    enabled: !!certificateId,
  });

  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Award className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
            <h1 className="text-3xl font-display font-bold text-white">Certificate Verification</h1>
          </div>

          <div className="card p-6">
            {isLoading ? (
              <div className="text-center py-8"><Spinner size="lg" className="mx-auto" /></div>
            ) : error ? (
              <div className="text-center py-6">
                <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Certificate Not Found</h3>
                <p className="text-slate-400 text-sm">This certificate ID is invalid or has been revoked.</p>
                <div className="mt-4 p-3 bg-slate-800 rounded-lg">
                  <p className="text-xs font-mono text-slate-500 break-all">{certificateId}</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">✓ Valid Certificate</h3>
                <p className="text-slate-400 text-sm mb-5">This certificate is authentic and valid.</p>
                <div className="space-y-3 text-left">
                  <Row label="Issued To" value={data.issuedTo} />
                  <Row label="Team" value={data.teamName} />
                  <Row label="Game" value={data.game} />
                  <Row label="Tournament" value={data.tournament} />
                  <Row label="Achievement" value={data.achievement} />
                  <Row label="Certificate ID" value={data.certificateId} mono />
                  <Row label="Issued On" value={new Date(data.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm text-slate-200 ${mono ? 'font-mono text-xs' : 'font-medium'} text-right max-w-[60%]`}>{value}</span>
    </div>
  );
}
