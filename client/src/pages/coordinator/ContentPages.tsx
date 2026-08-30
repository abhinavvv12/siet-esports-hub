import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Upload, Star, BookOpen, Image, Award, Megaphone } from 'lucide-react';
import CoordinatorLayout from '../../components/coordinator/CoordinatorLayout';
import { Modal, ConfirmDialog, EmptyState, Spinner, Alert } from '../../components/ui';
import { Rule, GalleryImage, Winner, Announcement, Tournament } from '../../types';
import api from '../../lib/api';

// ─── Rules ────────────────────────────────────────────────────────
export function RulesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ruleNumber: 1, content: '' });

  const { data: rules = [], isLoading } = useQuery<Rule[]>({
    queryKey: ['admin-rules'],
    queryFn: () => api.get('/rules').then(r => r.data.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-rules'] });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) => editing
      ? api.patch(`/admin/rules/${editing.id}`, data)
      : api.post('/admin/rules', data),
    onSuccess: () => { toast.success(editing ? 'Rule updated!' : 'Rule added!'); setModal(false); setEditing(null); invalidate(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/rules/${id}`),
    onSuccess: () => { toast.success('Rule deleted'); setDeleteId(null); invalidate(); },
  });

  const openEdit = (r: Rule) => {
    setEditing(r); setForm({ ruleNumber: r.ruleNumber, content: r.content }); setModal(true);
  };
  const openCreate = () => {
    setEditing(null); setForm({ ruleNumber: rules.length + 1, content: '' }); setModal(true);
  };

  return (
    <CoordinatorLayout title="Rules">
      <div className="p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Tournament Rules</h2>
          <button onClick={openCreate} className="flex items-center gap-2 btn-primary text-sm py-2">
            <Plus className="h-4 w-4" /> Add Rule
          </button>
        </div>
        <p className="text-slate-400 text-sm">Rules are displayed publicly on the website. Changes take effect immediately.</p>

        {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          : !rules.length ? <EmptyState icon={BookOpen} title="No rules yet" action={{ label: 'Add First Rule', onClick: openCreate }} />
          : (
            <div className="space-y-3">
              {rules.map(rule => (
                <div key={rule.id} className="coord-card flex items-start gap-4 hover:border-slate-700 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-mono font-bold text-indigo-400">{String(rule.ruleNumber).padStart(2, '0')}</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed flex-1">{rule.content}</p>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(rule)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setDeleteId(rule.id)} className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-900/20"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Rule' : 'Add Rule'}>
        <div className="space-y-4">
          <div>
            <label className="label">Rule Number</label>
            <input type="number" value={form.ruleNumber} onChange={e => setForm(f => ({ ...f, ruleNumber: Number(e.target.value) }))} className="input" />
          </div>
          <div>
            <label className="label">Rule Content *</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="input min-h-[100px]" placeholder="Enter the rule text..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800">Cancel</button>
            <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="btn-primary text-sm py-2 flex items-center gap-2">
              {saveMutation.isPending && <Spinner size="sm" />} Save Rule
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Rule" message="This rule will be removed from the public website immediately."
        confirmLabel="Delete" isLoading={deleteMutation.isPending} />
    </CoordinatorLayout>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────
export function GalleryPage() {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [featured, setFeatured] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ['admin-gallery'],
    queryFn: () => api.get('/gallery').then(r => r.data.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-gallery'] });

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('title', title || file.name.replace(/\.[^.]+$/, ''));
      fd.append('description', desc);
      fd.append('isFeatured', String(featured));
      try {
        await api.post('/admin/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    toast.success('Upload complete!');
    setUploading(false);
    setTitle(''); setDesc(''); setFeatured(false);
    invalidate();
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/gallery/${id}`),
    onSuccess: () => { toast.success('Deleted'); setDeleteId(null); invalidate(); },
  });

  const toggleFeatured = async (img: GalleryImage) => {
    await api.patch(`/admin/gallery/${img.id}`, { isFeatured: !img.isFeatured });
    invalidate();
  };

  return (
    <CoordinatorLayout title="Gallery">
      <div className="p-4 sm:p-6 space-y-5">
        <h2 className="text-xl font-bold text-white">Gallery Management</h2>

        {/* Upload area */}
        <div className="coord-card">
          <h3 className="text-sm font-semibold text-white mb-4">Upload Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="label">Title (optional)</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="Image title" />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <input value={desc} onChange={e => setDesc(e.target.value)} className="input" placeholder="Brief description" />
            </div>
          </div>
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="rounded border-slate-600 bg-slate-800 text-indigo-600" />
            <span className="text-sm text-slate-300">Mark as featured</span>
          </label>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {uploading ? <><Spinner size="sm" /> Uploading...</> : <><Upload className="h-4 w-4" /> Select & Upload Images</>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
          <p className="text-xs text-slate-500 mt-2">Accepted: JPEG, PNG, WebP. Max 5MB per file.</p>
        </div>

        {/* Grid */}
        {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          : !images.length ? <EmptyState icon={Image} title="No images uploaded" description="Upload images to populate the public gallery." />
          : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map(img => (
                <div key={img.id} className="group relative rounded-xl overflow-hidden bg-slate-800 aspect-square">
                  <img src={img.url} alt={img.title || ''} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => toggleFeatured(img)} className={`p-1.5 rounded-lg ${img.isFeatured ? 'bg-yellow-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'}`}>
                      <Star className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteId(img.id)} className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {img.isFeatured && (
                    <div className="absolute top-2 left-2 bg-yellow-500/90 text-black text-xs font-bold px-1.5 py-0.5 rounded">★ Featured</div>
                  )}
                  {img.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                      <p className="text-white text-xs truncate">{img.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Image" message="This image will be permanently removed from the gallery."
        confirmLabel="Delete" isLoading={deleteMutation.isPending} />
    </CoordinatorLayout>
  );
}

// ─── Winners ──────────────────────────────────────────────────────
export function WinnersPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Winner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    tournamentId: '', game: 'BGMI', position: 'FIRST' as Winner['position'],
    teamName: '', players: ['', '', '', ''], description: '',
  });

  const { data: winners = [], isLoading } = useQuery<Winner[]>({
    queryKey: ['admin-winners'],
    queryFn: () => api.get('/winners').then(r => r.data.data),
  });

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ['admin-tournaments'],
    queryFn: () => api.get('/admin/tournaments').then(r => r.data.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-winners'] });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) => editing
      ? api.patch(`/admin/winners/${editing.id}`, { ...data, players: data.players.filter(Boolean) })
      : api.post('/admin/winners', { ...data, players: data.players.filter(Boolean) }),
    onSuccess: () => { toast.success(editing ? 'Updated!' : 'Winner added!'); setModal(false); setEditing(null); invalidate(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/winners/${id}`),
    onSuccess: () => { toast.success('Deleted'); setDeleteId(null); invalidate(); },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ tournamentId: tournaments[0]?.id || '', game: 'BGMI', position: 'FIRST', teamName: '', players: ['', '', '', ''], description: '' });
    setModal(true);
  };

  const positionLabel: Record<string, string> = { FIRST: '🥇 1st Place', SECOND: '🥈 2nd Place', THIRD: '🥉 3rd Place', MVP: '⭐ MVP' };

  return (
    <CoordinatorLayout title="Winners">
      <div className="p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Winners / Hall of Fame</h2>
          <button onClick={openCreate} className="flex items-center gap-2 btn-primary text-sm py-2">
            <Plus className="h-4 w-4" /> Add Winner
          </button>
        </div>

        {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          : !winners.length ? (
            <div>
              <EmptyState icon={Award} title="No winners recorded yet"
                description="Add winners after the tournament concludes. They will automatically appear on the public website."
                action={{ label: 'Add Winner', onClick: openCreate }} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {winners.map(w => (
                <div key={w.id} className="coord-card hover:border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold text-white">{positionLabel[w.position] || w.position}</p>
                      <p className="text-indigo-400 text-sm font-semibold">{w.teamName}</p>
                      <p className="text-slate-500 text-xs">{w.game} • {w.tournament?.name}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setDeleteId(w.id)} className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  {w.players?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {w.players.map((p, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full">{p}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Winner" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tournament</label>
              <select value={form.tournamentId} onChange={e => setForm(f => ({ ...f, tournamentId: e.target.value }))} className="select">
                <option value="">Select tournament</option>
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Game</label>
              <select value={form.game} onChange={e => setForm(f => ({ ...f, game: e.target.value }))} className="select">
                <option>BGMI</option>
                <option>Free Fire MAX</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Position</label>
              <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value as Winner['position'] }))} className="select">
                <option value="FIRST">1st Place</option>
                <option value="SECOND">2nd Place</option>
                <option value="THIRD">3rd Place</option>
                <option value="MVP">MVP</option>
              </select>
            </div>
            <div>
              <label className="label">Team Name</label>
              <input value={form.teamName} onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))} className="input" placeholder="Winning team name" />
            </div>
          </div>
          <div>
            <label className="label">Player Names</label>
            <div className="grid grid-cols-2 gap-2">
              {form.players.map((p, i) => (
                <input key={i} value={p} onChange={e => setForm(f => ({ ...f, players: f.players.map((x, j) => j === i ? e.target.value : x) }))}
                  className="input" placeholder={`Player ${i + 1}`} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800">Cancel</button>
            <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="btn-primary text-sm py-2 flex items-center gap-2">
              {saveMutation.isPending && <Spinner size="sm" />} Save Winner
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Winner" message="Remove this winner from the Hall of Fame?"
        confirmLabel="Delete" isLoading={deleteMutation.isPending} />
    </CoordinatorLayout>
  );
}

// ─── Announcements ────────────────────────────────────────────────
export function AnnouncementsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'DRAFT' as Announcement['status'] });

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ['admin-announcements'],
    queryFn: () => api.get('/admin/announcements').then(r => r.data.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-announcements'] });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) => editing
      ? api.patch(`/admin/announcements/${editing.id}`, data)
      : api.post('/admin/announcements', data),
    onSuccess: () => { toast.success(editing ? 'Updated!' : 'Created!'); setModal(false); setEditing(null); invalidate(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/announcements/${id}`),
    onSuccess: () => { toast.success('Deleted'); setDeleteId(null); invalidate(); },
  });

  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', status: 'DRAFT' }); setModal(true); };
  const openEdit = (a: Announcement) => {
    setEditing(a); setForm({ title: a.title, description: a.description, status: a.status as Announcement['status'] }); setModal(true);
  };

  const statusColor: Record<string, string> = {
    DRAFT: 'text-slate-400 bg-slate-700/40',
    PUBLISHED: 'text-green-300 bg-green-900/40 border border-green-700/30',
    ARCHIVED: 'text-slate-500 bg-slate-800/40',
  };

  return (
    <CoordinatorLayout title="Announcements">
      <div className="p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Announcements</h2>
          <button onClick={openCreate} className="flex items-center gap-2 btn-primary text-sm py-2">
            <Plus className="h-4 w-4" /> New Announcement
          </button>
        </div>
        <p className="text-slate-400 text-sm">Published announcements appear on the public website banner.</p>

        {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          : !announcements.length ? <EmptyState icon={Megaphone} title="No announcements" action={{ label: 'Create Announcement', onClick: openCreate }} />
          : (
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className="coord-card hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{a.title}</h3>
                        <span className={`badge text-xs ${statusColor[a.status] || ''}`}>{a.status}</span>
                      </div>
                      <p className="text-slate-400 text-sm line-clamp-2">{a.description}</p>
                      <p className="text-xs text-slate-600 mt-1">{new Date(a.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(a)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(a.id)} className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Announcement' : 'New Announcement'}>
        <div className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" placeholder="Announcement title" />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input min-h-[100px]" placeholder="Full announcement text..." />
          </div>
          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Announcement['status'] }))} className="select">
              <option value="DRAFT">Draft (hidden)</option>
              <option value="PUBLISHED">Published (visible on website)</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          {form.status === 'PUBLISHED' && (
            <Alert type="info">This announcement will be visible on the public website immediately after saving.</Alert>
          )}
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800">Cancel</button>
            <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="btn-primary text-sm py-2 flex items-center gap-2">
              {saveMutation.isPending && <Spinner size="sm" />} Save
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Announcement" message="This will permanently remove the announcement."
        confirmLabel="Delete" isLoading={deleteMutation.isPending} />
    </CoordinatorLayout>
  );
}
