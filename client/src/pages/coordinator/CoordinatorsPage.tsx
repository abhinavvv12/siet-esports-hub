import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import CoordinatorLayout from '../../components/coordinator/CoordinatorLayout';
import { Modal, ConfirmDialog, EmptyState, Spinner } from '../../components/ui';
import { FacultyCoordinator, StudentCoordinator } from '../../types';
import api from '../../lib/api';

// ─── Faculty Management ───────────────────────────────────────────
export function FacultyPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<FacultyCoordinator | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', designation: '', department: '', email: '', phone: '', displayOrder: 1 });

  const { data: faculty = [], isLoading } = useQuery<FacultyCoordinator[]>({
    queryKey: ['admin-faculty'],
    queryFn: () => api.get('/faculty').then(r => r.data.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-faculty'] });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) => editing
      ? api.patch(`/admin/faculty/${editing.id}`, data)
      : api.post('/admin/faculty', data),
    onSuccess: () => { toast.success(editing ? 'Updated!' : 'Created!'); setModal(false); setEditing(null); invalidate(); },
    onError: () => toast.error('Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/faculty/${id}`),
    onSuccess: () => { toast.success('Deleted'); setDeleteId(null); invalidate(); },
  });

  const openEdit = (f: FacultyCoordinator) => {
    setEditing(f);
    setForm({ name: f.name, designation: f.designation, department: f.department, email: f.email || '', phone: f.phone || '', displayOrder: f.displayOrder });
    setModal(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', designation: '', department: '', email: '', phone: '', displayOrder: faculty.length + 1 });
    setModal(true);
  };

  return (
    <CoordinatorLayout title="Faculty Coordinators">
      <div className="p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Faculty Coordinators</h2>
          <button onClick={openCreate} className="flex items-center gap-2 btn-primary text-sm py-2">
            <Plus className="h-4 w-4" /> Add Faculty
          </button>
        </div>

        {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          : !faculty.length ? <EmptyState icon={GripVertical} title="No faculty coordinators" action={{ label: 'Add Faculty', onClick: openCreate }} />
          : (
            <div className="coord-card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50 border-b border-slate-800">
                  <tr>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3 font-medium">#</th>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3 font-medium">Name</th>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3 font-medium hidden md:table-cell">Designation</th>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3 font-medium hidden lg:table-cell">Department</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {faculty.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-slate-500 text-xs">{f.displayOrder}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{f.name}</p>
                        {f.email && <p className="text-xs text-slate-500">{f.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{f.designation}</td>
                      <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{f.department}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => openEdit(f)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(f.id)} className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-900/20 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Faculty Coordinator' : 'Add Faculty Coordinator'}>
        <div className="space-y-4">
          {[
            ['name', 'Full Name *', 'text'],
            ['designation', 'Designation *', 'text'],
            ['department', 'Department *', 'text'],
            ['email', 'Email', 'email'],
            ['phone', 'Phone', 'tel'],
            ['displayOrder', 'Display Order', 'number'],
          ].map(([key, label, type]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                type={type}
                value={String(form[key as keyof typeof form])}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="input"
              />
            </div>
          ))}
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800">Cancel</button>
            <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="btn-primary text-sm py-2 flex items-center gap-2">
              {saveMutation.isPending && <Spinner size="sm" />} Save
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Faculty Coordinator" message="This will remove them from the public website."
        confirmLabel="Delete" isLoading={deleteMutation.isPending} />
    </CoordinatorLayout>
  );
}

// ─── Student Coordinators ─────────────────────────────────────────
export function StudentsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<StudentCoordinator | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', department: '', year: '', role: '', phone: '', email: '', displayOrder: 1 });

  const { data: students = [], isLoading } = useQuery<StudentCoordinator[]>({
    queryKey: ['admin-students'],
    queryFn: () => api.get('/students').then(r => r.data.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-students'] });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) => editing
      ? api.patch(`/admin/students/${editing.id}`, data)
      : api.post('/admin/students', data),
    onSuccess: () => { toast.success(editing ? 'Updated!' : 'Created!'); setModal(false); setEditing(null); invalidate(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/students/${id}`),
    onSuccess: () => { toast.success('Deleted'); setDeleteId(null); invalidate(); },
  });

  const openEdit = (s: StudentCoordinator) => {
    setEditing(s);
    setForm({ name: s.name, department: s.department, year: s.year, role: s.role || '', phone: s.phone || '', email: s.email || '', displayOrder: s.displayOrder });
    setModal(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', department: '', year: '', role: '', phone: '', email: '', displayOrder: students.length + 1 });
    setModal(true);
  };

  const YEARS = ['I Year', 'II Year', 'III Year', 'IV Year'];

  return (
    <CoordinatorLayout title="Student Coordinators">
      <div className="p-4 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Student Coordinators</h2>
          <button onClick={openCreate} className="flex items-center gap-2 btn-primary text-sm py-2">
            <Plus className="h-4 w-4" /> Add Student
          </button>
        </div>

        {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          : !students.length ? <EmptyState icon={GripVertical} title="No student coordinators" action={{ label: 'Add Student', onClick: openCreate }} />
          : (
            <div className="coord-card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50 border-b border-slate-800">
                  <tr>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-3 font-medium">#</th>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-3 font-medium">Name</th>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-3 font-medium hidden sm:table-cell">Dept / Year</th>
                    <th className="text-left text-xs text-slate-500 uppercase px-4 py-3 font-medium hidden md:table-cell">Phone</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-slate-500 text-xs">{s.displayOrder}</td>
                      <td className="px-4 py-3 font-medium text-white">{s.name}</td>
                      <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{s.department} • {s.year}</td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{s.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => openEdit(s)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(s.id)} className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Student Coordinator' : 'Add Student Coordinator'}>
        <div className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Department *</label>
              <input type="text" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="input" placeholder="e.g. CSE" />
            </div>
            <div>
              <label className="label">Year *</label>
              <select value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="select">
                <option value="">Select Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Role (optional)</label>
            <input type="text" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input" placeholder="e.g. Technical Lead" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Display Order</label>
              <input type="number" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))} className="input" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800">Cancel</button>
            <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="btn-primary text-sm py-2 flex items-center gap-2">
              {saveMutation.isPending && <Spinner size="sm" />} Save
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Student Coordinator" message="This will remove them from the public website."
        confirmLabel="Delete" isLoading={deleteMutation.isPending} />
    </CoordinatorLayout>
  );
}
