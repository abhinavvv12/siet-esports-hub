import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Users, ChevronRight, CheckCircle, Copy } from 'lucide-react';
import api from '../../lib/api';
import PublicLayout from '../../components/layout/PublicLayout';
import { FormError, Alert, Spinner } from '../../components/ui';
import { Tournament } from '../../types';

const playerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  rollNumber: z.string().min(3, 'Roll number is required'),
  classSection: z.string().min(1, 'Class/Section is required'),
  year: z.string().min(1, 'Year is required'),
  department: z.string().min(1, 'Department is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number').optional().or(z.literal('')),
});

const schema = z.object({
  tournamentId: z.string().min(1, 'Please select a tournament'),
  teamName: z.string().min(2, 'Team name is required').max(30, 'Team name too long'),
  players: z.array(playerSchema).length(4),
  leaderEmail: z.string().email('Invalid email'),
  leaderMobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit mobile number'),
});

type FormData = z.infer<typeof schema>;

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CIVIL', 'CSE (AI & ML)', 'CSE (Data Science)', 'Other'];
const YEARS = ['I Year', 'II Year', 'III Year', 'IV Year'];

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState<{ code: string; teamName: string } | null>(null);
  const [apiError, setApiError] = useState('');

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ['tournaments-public'],
    queryFn: () => api.get('/tournaments/public').then(r => r.data.data),
  });

  const openTournaments = tournaments.filter(t => t.registrationOpen && t.status === 'REGISTRATION_OPEN');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tournamentId: searchParams.get('tournament') || '',
      teamName: '',
      leaderEmail: '',
      leaderMobile: '',
      players: Array(4).fill({
        fullName: '', rollNumber: '', classSection: '', year: '', department: '', email: '', mobile: '',
      }),
    },
  });

  const { fields } = useFieldArray({ control, name: 'players' });
  const selectedTournamentId = watch('tournamentId');
  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);

  useEffect(() => {
    const preselect = searchParams.get('tournament');
    if (preselect) setValue('tournamentId', preselect);
  }, [searchParams, setValue]);

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      const payload = {
        tournamentId: data.tournamentId,
        teamName: data.teamName,
        players: data.players.map((p, i) => ({
          ...p,
          playerNumber: i + 1,
          isLeader: i === 0,
          mobile: i === 0 ? data.leaderMobile : p.mobile,
          email: i === 0 ? data.leaderEmail : p.email,
        })),
      };
      const res = await api.post('/registrations', payload);
      setSubmitted({ code: res.data.data.registrationCode, teamName: data.teamName });
      toast.success('Registration submitted!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      setApiError(msg);
      toast.error(msg);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  if (submitted) {
    return (
      <PublicLayout>
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            <div className="card p-8">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">Registration Submitted!</h2>
              <p className="text-slate-400 mb-6">Your squad has been registered. Please save your registration code.</p>

              <div className="bg-slate-800 rounded-xl p-5 mb-6">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Registration Code</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xl font-mono font-bold text-indigo-300">{submitted.code}</p>
                  <button onClick={() => copyCode(submitted.code)} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
                    <Copy className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Team: <strong className="text-slate-300">{submitted.teamName}</strong></p>
              </div>

              <Alert type="warning">
                <strong>⚠️ Important:</strong> Your slot is <strong>not confirmed</strong> yet. Please visit the SIET Esports Club Coordinator to make the cash payment. Your registration will be approved after payment verification.
              </Alert>

              <div className="flex gap-3 mt-6">
                <Link to="/" className="btn-secondary flex-1 text-center text-sm py-2.5">Back to Home</Link>
                <Link to="/certificates" className="btn-primary flex-1 text-center text-sm py-2.5">Check Status</Link>
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest mb-3">Join the Championship</p>
            <h1 className="text-4xl font-display font-bold text-white mb-3">Register Your <span className="text-gradient">Squad</span></h1>
            <p className="text-slate-400 text-sm">Form a team of exactly 4 players and compete in SIET Esports Championship 2026.</p>
          </div>

          {openTournaments.length === 0 && (
            <Alert type="warning">
              No tournaments are currently accepting registrations. Check back soon!
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Team Info */}
            <div className="card p-6">
              <h2 className="text-lg font-display font-semibold text-white mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-600/30 rounded text-xs flex items-center justify-center text-indigo-400 font-mono">1</span>
                Team Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Select Tournament *</label>
                  <select {...register('tournamentId')} className="select">
                    <option value="">Choose a tournament</option>
                    {openTournaments.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <FormError message={errors.tournamentId?.message} />
                </div>
                <div>
                  <label className="label">Team Name *</label>
                  <input {...register('teamName')} className="input" placeholder="e.g. Phoenix Esports" />
                  <FormError message={errors.teamName?.message} />
                </div>
              </div>
              {selectedTournament && (
                <div className="mt-4 p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-300">
                  ✓ {selectedTournament.name} — {selectedTournament.game} | Team size: {selectedTournament.teamSize} players
                </div>
              )}
            </div>

            {/* Team Leader Contact */}
            <div className="card p-6">
              <h2 className="text-lg font-display font-semibold text-white mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-600/30 rounded text-xs flex items-center justify-center text-indigo-400 font-mono">2</span>
                Team Leader Contact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Email Address *</label>
                  <input {...register('leaderEmail')} type="email" className="input" placeholder="leader@email.com" />
                  <FormError message={errors.leaderEmail?.message} />
                </div>
                <div>
                  <label className="label">Mobile Number *</label>
                  <input {...register('leaderMobile')} type="tel" className="input" placeholder="10-digit mobile number" maxLength={10} />
                  <FormError message={errors.leaderMobile?.message} />
                  <p className="text-xs text-slate-500 mt-1">Used for certificate verification</p>
                </div>
              </div>
            </div>

            {/* Players */}
            {fields.map((field, index) => (
              <div key={field.id} className="card p-6">
                <h2 className="text-lg font-display font-semibold text-white mb-5 flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-600/30 rounded text-xs flex items-center justify-center text-indigo-400 font-mono">{index + 3}</span>
                  <Users className="h-4 w-4 text-indigo-400" />
                  {index === 0 ? 'Team Leader / Player 1' : `Player ${index + 1}`}
                  {index === 0 && <span className="text-xs bg-indigo-600/20 text-indigo-300 px-2 py-0.5 rounded-full ml-auto">Leader</span>}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input {...register(`players.${index}.fullName`)} className="input" placeholder="Full name as per ID" />
                    <FormError message={errors.players?.[index]?.fullName?.message} />
                  </div>
                  <div>
                    <label className="label">Roll Number *</label>
                    <input {...register(`players.${index}.rollNumber`)} className="input" placeholder="e.g. 21CSE001" />
                    <FormError message={errors.players?.[index]?.rollNumber?.message} />
                  </div>
                  <div>
                    <label className="label">Class / Section *</label>
                    <input {...register(`players.${index}.classSection`)} className="input" placeholder="e.g. CSE-A" />
                    <FormError message={errors.players?.[index]?.classSection?.message} />
                  </div>
                  <div>
                    <label className="label">Year *</label>
                    <select {...register(`players.${index}.year`)} className="select">
                      <option value="">Select Year</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <FormError message={errors.players?.[index]?.year?.message} />
                  </div>
                  <div>
                    <label className="label">Department *</label>
                    <select {...register(`players.${index}.department`)} className="select">
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <FormError message={errors.players?.[index]?.department?.message} />
                  </div>
                  {index === 0 ? null : (
                    <div>
                      <label className="label">Mobile {index === 0 ? '*' : '(optional)'}</label>
                      <input {...register(`players.${index}.mobile`)} type="tel" className="input" placeholder="10-digit mobile" maxLength={10} />
                      <FormError message={errors.players?.[index]?.mobile?.message} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Error */}
            {apiError && <Alert type="error">{apiError}</Alert>}

            {/* Payment Note */}
            <Alert type="info">
              <strong>💰 Payment:</strong> Entry fee is collected as <strong>cash payment only</strong> at the SIET Esports Club. Submit this form first, then meet a coordinator to confirm your slot.
            </Alert>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || openTournaments.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
            >
              {isSubmitting ? <><Spinner size="sm" /> Submitting Registration...</> : <>
                Register Our Squad <ChevronRight className="h-5 w-5" />
              </>}
            </button>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
}
