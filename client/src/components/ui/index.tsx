import { ReactNode, useState } from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Info, Loader2 } from 'lucide-react';
import { RegistrationStatus, PaymentStatus, CertificateStatus, EventStatus } from '../../types';

// ─── Spinner ───────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return <Loader2 className={`${sizes[size]} animate-spin text-indigo-400 ${className}`} />;
};

// ─── Status Badges ────────────────────────────────────────────────
export const RegistrationBadge = ({ status }: { status: RegistrationStatus }) => {
  const map: Record<RegistrationStatus, { label: string; cls: string }> = {
    PENDING_APPROVAL: { label: 'Pending', cls: 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/30' },
    APPROVED: { label: 'Approved', cls: 'bg-green-900/40 text-green-300 border border-green-700/30' },
    REJECTED: { label: 'Rejected', cls: 'bg-red-900/40 text-red-300 border border-red-700/30' },
    CANCELLED: { label: 'Cancelled', cls: 'bg-slate-700/40 text-slate-400 border border-slate-600/30' },
  };
  const { label, cls } = map[status];
  return <span className={`badge ${cls}`}>{label}</span>;
};

export const PaymentBadge = ({ status }: { status: PaymentStatus }) => {
  const map: Record<PaymentStatus, { label: string; cls: string }> = {
    PENDING: { label: 'Payment Pending', cls: 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/30' },
    VERIFIED: { label: 'Payment Verified', cls: 'bg-green-900/40 text-green-300 border border-green-700/30' },
    REJECTED: { label: 'Payment Rejected', cls: 'bg-red-900/40 text-red-300 border border-red-700/30' },
  };
  const { label, cls } = map[status];
  return <span className={`badge ${cls}`}>{label}</span>;
};

export const CertBadge = ({ status }: { status: CertificateStatus }) => {
  const map: Record<CertificateStatus, { label: string; cls: string }> = {
    NOT_GENERATED: { label: 'Not Generated', cls: 'bg-slate-700/40 text-slate-400' },
    GENERATED: { label: 'Available', cls: 'bg-indigo-900/40 text-indigo-300 border border-indigo-700/30' },
    REVOKED: { label: 'Revoked', cls: 'bg-red-900/40 text-red-300' },
  };
  const { label, cls } = map[status];
  return <span className={`badge ${cls}`}>{label}</span>;
};

export const EventStatusBadge = ({ status }: { status: EventStatus }) => {
  const map: Record<EventStatus, { label: string; cls: string }> = {
    DRAFT: { label: 'Draft', cls: 'bg-slate-700/40 text-slate-400' },
    UPCOMING: { label: 'Upcoming', cls: 'bg-blue-900/40 text-blue-300 border border-blue-700/30' },
    REGISTRATION_OPEN: { label: 'Registrations Open', cls: 'bg-green-900/40 text-green-300 border border-green-700/30' },
    REGISTRATION_CLOSED: { label: 'Registrations Closed', cls: 'bg-orange-900/40 text-orange-300 border border-orange-700/30' },
    ONGOING: { label: 'Ongoing', cls: 'bg-indigo-900/40 text-indigo-300 border border-indigo-700/30' },
    COMPLETED: { label: 'Completed', cls: 'bg-purple-900/40 text-purple-300' },
    CANCELLED: { label: 'Cancelled', cls: 'bg-red-900/40 text-red-300' },
  };
  const { label, cls } = map[status];
  return <span className={`badge ${cls}`}>{label}</span>;
};

// ─── Modal ────────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-slate-900 border border-slate-700 rounded-2xl w-full ${sizes[size]} shadow-2xl`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────────────
interface ConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', type = 'danger', isLoading }: ConfirmProps) => {
  if (!isOpen) return null;
  const btnCls = type === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500';
  const Icon = type === 'danger' ? XCircle : type === 'warning' ? AlertTriangle : Info;
  const iconCls = type === 'danger' ? 'text-red-400' : type === 'warning' ? 'text-yellow-400' : 'text-indigo-400';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-start gap-4 mb-5">
          <Icon className={`h-6 w-6 ${iconCls} flex-shrink-0 mt-0.5`} />
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-slate-400 text-sm">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isLoading} className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${btnCls}`}>
            {isLoading ? <Spinner size="sm" className="inline mr-2" /> : null}{confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Alert ────────────────────────────────────────────────────────
export const Alert = ({ type, children }: { type: 'success' | 'error' | 'warning' | 'info'; children: ReactNode }) => {
  const config = {
    success: { icon: CheckCircle, cls: 'bg-green-900/30 border-green-700/30 text-green-300' },
    error: { icon: XCircle, cls: 'bg-red-900/30 border-red-700/30 text-red-300' },
    warning: { icon: AlertTriangle, cls: 'bg-yellow-900/30 border-yellow-700/30 text-yellow-300' },
    info: { icon: Info, cls: 'bg-indigo-900/30 border-indigo-700/30 text-indigo-300' },
  }[type];
  const Icon = config.icon;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${config.cls}`}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="text-sm">{children}</div>
    </div>
  );
};

// ─── Empty State ─────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }: {
  icon: React.ElementType; title: string; description?: string;
  action?: { label: string; onClick: () => void };
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
      <Icon className="h-10 w-10 text-slate-500" />
    </div>
    <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
    {description && <p className="text-slate-500 text-sm max-w-sm mb-4">{description}</p>}
    {action && <button onClick={action.onClick} className="btn-primary text-sm py-2">{action.label}</button>}
  </div>
);

// ─── Form Error ───────────────────────────────────────────────────
export const FormError = ({ message }: { message?: string }) =>
  message ? <p className="text-red-400 text-xs mt-1">{message}</p> : null;

// ─── Search Input ─────────────────────────────────────────────────
export const SearchInput = ({ value, onChange, placeholder = 'Search...' }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) => (
  <div className="relative">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input pl-9 py-2 text-sm"
    />
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────
export const SkeletonCard = () => (
  <div className="card p-5 space-y-3">
    <div className="skeleton h-4 w-2/3" />
    <div className="skeleton h-3 w-1/2" />
    <div className="skeleton h-3 w-3/4" />
  </div>
);

// ─── Pagination ───────────────────────────────────────────────────
export const Pagination = ({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2 justify-center mt-4">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="px-3 py-1.5 text-sm border border-slate-700 rounded-lg hover:bg-slate-800 disabled:opacity-40 text-slate-300">Prev</button>
      <span className="text-sm text-slate-400">{page} / {totalPages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className="px-3 py-1.5 text-sm border border-slate-700 rounded-lg hover:bg-slate-800 disabled:opacity-40 text-slate-300">Next</button>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, color = 'indigo', sub }: {
  label: string; value: string | number; icon: React.ElementType; color?: string; sub?: string;
}) => {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-600/20 text-indigo-400',
    green: 'bg-green-600/20 text-green-400',
    yellow: 'bg-yellow-600/20 text-yellow-400',
    red: 'bg-red-600/20 text-red-400',
    purple: 'bg-purple-600/20 text-purple-400',
    blue: 'bg-blue-600/20 text-blue-400',
  };
  return (
    <div className="coord-card hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-white font-display">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${colors[color] || colors.indigo}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

// ─── Toast-like notification (simple) ────────────────────────────
export const useToggle = (initial = false) => {
  const [state, setState] = useState(initial);
  return [state, () => setState((s) => !s), (v: boolean) => setState(v)] as const;
};
