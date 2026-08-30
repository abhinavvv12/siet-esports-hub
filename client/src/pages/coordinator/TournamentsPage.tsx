import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Trophy } from 'lucide-react';
import CoordinatorLayout from '../../components/coordinator/CoordinatorLayout';
import { Modal, ConfirmDialog, EventStatusBadge, EmptyState, Spinner } from '../../components/ui';
import { Tournament, EventStatus } from '../../types';
import api from '../../lib/api';

const EVENT_STATUSES: EventStatus[] = [
  'DRAFT', 'UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED'
];

const defaultForm = {
  name: '', game: 'BGMI', description: '', venue: 'SIET Campus, Ibrahimpatnam',
  entryFee: 'Cash Payment Only', maxTeams: 32, teamSize: 4, prizePool: '',
  status: 'DRAFT' as EventStatus, registrationOpen: false,
  startDate: '', endDate: '', registrationDeadline: '',
};

export default function TournamentsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Tournament | null>(null);
  const [form, setForm] = useState({ ...defaultForm });

  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ['admin-tournaments'],
    queryFn: () => api.get('/admin/tournaments').then(r => r.data.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-tournaments'] });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/admin/tournaments', {
      ...data,
      maxTeams: Number(data.maxTeams),
      teamSize: Number(data.teamSize),
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      registrationDeadline: data.registrationDeadline || null,
    }),
    onSuccess: () => { toast.success('Tournament created!'); setModal(null); setForm({ ...defaultForm }); invalidate(); },
    onError: () => toast.error('Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) => api.patch(`/admin/tournaments/${id}`, {
      ...data,
      maxTeams: Number(data.maxTeams),
      teamSize: Number(data.teamSize),
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      registrationDeadline: data.registrationDeadline || null,
    }),
    onSuccess: () => { toast.success('Tournament updated!'); setModal(null); invalidate(); },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/tournaments/${id}`),
    onSuccess: (res) => { toast.success(res.data.message || 'Done'); setDeleteId(null); invalidate(); },
    onError: () => toast.error('Failed'),
  });

  const openEdit = (t: Tournament) => {
    setEditTarget(t);
    setForm({
      name: t.name, game: t.game, description: t.description || '',
      venue: t.venue || '', entryFee: t.entryFee || '', maxTeams: t.maxTeams ?? 32,
      teamSize: t.teamSize, prizePool: t.prizePool || '', status: t.status,
      registrationOpen: t.registrationOpen,
      startDate: t.startDate ? t.startDate.split('T')[0] : '',
      endDate: t.endDate ? t.endDate.split('T')[0] : '',
      registrationDeadline: t.registrationDeadline ? t.registrationDeadline.split('T')[0] : '',
    });
    setModal('edit');
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Tournament name is required'); return; }
    if (modal === 'create') createMutation.mutate(form);
    else if (modal === 'edit' && editTarget) updateMutation.mutate({ id: editTarget.id, data: form });
  };

  const F = (key: keyof typeof form, label: string, type = 'text', opts?: string[]) => (
    <div>
      <label className="label">{label}</label>
      {opts ? (
        <select
          value={String(form[key])}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="select"
        >
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={String(form[key])}
          onChange={e => setForm(f => ({ ...f, [key]: type === 'checkbox' ? !f[key] : e.target.value }))}
          className="input"
        />
      )}
    </div>
  );

  return (
    <CoordinatorLayout title="Tournaments">
      <div className="p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Tournaments</h2>
          <button onClick={() => { setForm({ ...defaultForm }); setModal('create'); }}
            className="flex items-center gap-2 btn-primary text-sm py-2">
            <Plus className="h-4 w-4" /> New Tournament
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : !tournaments.length ? (
          <EmptyState icon={Trophy} title="No tournaments yet"
            description="Create your first tournament to get started."
            action={{ label: 'Create Tournament', onClick: () => setModal('create') }} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tournaments.map(t => (
              <div key={t.id} className="coord-card hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{t.name}</h3>
                    <p className="text-indigo-400 text-xs font-mono mt-0.5">{t.game}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <EventStatusBadge status={t.status} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4">
                  <span>📍 {t.venue || 'TBD'}</span>
                  <span>👥 {t._count?.registrations ?? 0} / {t.maxTeams ?? '∞'} teams</span>
                  <span>📅 {t.startDate ? new Date(t.startDate).toLocaleDateString('en-IN') : 'Date TBD'}</span>
                  <span>💰 {t.entryFee || 'TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(t)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteId(t.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-500/20 rounded-lg hover:bg-red-600/10 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                  <div className={`ml-auto flex items-center gap-1.5 text-xs ${t.registrationOpen ? 'text-green-400' : 'text-slate-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${t.registrationOpen ? 'bg-green-400' : 'bg-slate-600'}`} />
                    {t.registrationOpen ? 'Registrations open' : 'Closed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modal === 'create' || modal === 'edit'}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Create Tournament' : 'Edit Tournament'}
        size="xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
          {F('name', 'Tournament Name *')}
          {F('game', 'Game', 'text', ['BGMI', 'Free Fire MAX', 'Valorant', 'PUBG Mobile', 'Other'])}
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input min-h-[70px]"
              placeholder="Brief description of the tournament..."
            />
          </div>
          {F('venue', 'Venue')}
          {F('entryFee', 'Entry Fee')}
          {F('maxTeams', 'Max Teams', 'number')}
          {F('teamSize', 'Team Size', 'number')}
          {F('prizePool', 'Prize Pool')}
          {F('startDate', 'Start Date', 'date')}
          {F('endDate', 'End Date', 'date')}
          {F('registrationDeadline', 'Registration Deadline', 'date')}
          {F('status', 'Event Status', 'text', EVENT_STATUSES)}
          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.registrationOpen}
                onChange={e => setForm(f => ({ ...f, registrationOpen: e.target.checked }))}
                className="w-4 h-4 text-indigo-600 rounded border-slate-600 bg-slate-800"
              />
              <span className="text-sm text-slate-300">Registrations Open (allows public to register)</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-5 pt-4 border-t border-slate-800">
          <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="btn-primary text-sm py-2 flex items-center gap-2"
          >
            {(createMutation.isPending || updateMutation.isPending) ? <Spinner size="sm" /> : null}
            {modal === 'create' ? 'Create Tournament' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Tournament"
        message="Tournaments with registrations will be archived instead of deleted to protect participant records."
        confirmLabel="Delete / Archive"
        isLoading={deleteMutation.isPending}
      />
    </CoordinatorLayout>
  );
}
