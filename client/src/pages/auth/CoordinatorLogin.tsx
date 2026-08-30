import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Gamepad2, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { FormError, Alert, Spinner } from '../../components/ui';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function CoordinatorLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      await login(data.email, data.password);
      navigate('/coordinator/dashboard');
    } catch (err: unknown) {
      setApiError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <span className="font-display font-bold text-white text-xl">
              SIET <span className="text-indigo-400">Esports</span>
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Coordinator Access</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to manage the SIET Esports Hub</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6 p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
            <Lock className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <p className="text-xs text-indigo-300">Restricted to authorized SIET Esports Club coordinators only.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="label">Email Address</label>
              <input
                {...register('email')}
                type="email"
                className="input"
                placeholder="coordinator@siet-esports.in"
                autoComplete="email"
              />
              <FormError message={errors.email?.message} />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FormError message={errors.password?.message} />
            </div>

            {apiError && <Alert type="error">{apiError}</Alert>}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {isSubmitting ? <><Spinner size="sm" /> Signing in...</> : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-xs text-slate-600 text-center">
              Not a coordinator? <a href="/" className="text-slate-400 hover:text-white transition-colors">Return to public website</a>
            </p>
          </div>
        </div>

        {/* Dev hint */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-500">
            <p className="font-medium text-slate-400 mb-1">Dev Credentials:</p>
            <p>Admin: admin@siet-esports.in / Admin@SIET2026</p>
            <p>Coord: coordinator@siet-esports.in / Coord@SIET2026</p>
          </div>
        )}
      </div>
    </div>
  );
}
