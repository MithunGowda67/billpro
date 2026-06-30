import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '../services/apiServices';
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Users, X, Save } from 'lucide-react';

export default function UserManagementPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', fullName: '', role: 'BILLING_STAFF', password: '' });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => usersApi.create(form),
    onSuccess: () => { toast.success('User created'); qc.invalidateQueries({ queryKey: ['users'] }); setShowModal(false); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create user'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => usersApi.toggleActive(id),
    onSuccess: () => { toast.success('User status updated'); qc.invalidateQueries({ queryKey: ['users'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries({ queryKey: ['users'] }); },
  });

  const openCreate = () => {
    setForm({ username: '', email: '', fullName: '', role: 'BILLING_STAFF', password: '' });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3"><Users className="w-6 h-6 text-primary-400" /> User Management</h1>
          <p className="page-subtitle">{users.length} users in your organization</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add User</button>
      </div>

      <div className="table-wrapper">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>User</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary-300">{u.fullName?.charAt(0) || 'U'}</span>
                      </div>
                      <span className="font-medium text-white">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="font-mono text-slate-300">{u.username}</td>
                  <td className="text-slate-400">{u.email}</td>
                  <td>
                    <span className={u.role === 'ADMIN' ? 'badge-purple' : 'badge-blue'}>
                      {u.role === 'ADMIN' ? 'Admin' : 'Billing Staff'}
                    </span>
                  </td>
                  <td>
                    {u.isActive
                      ? <span className="badge-green">Active</span>
                      : <span className="badge-red">Inactive</span>}
                  </td>
                  <td className="text-slate-500 text-xs">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleMutation.mutate(u.id)}
                        className={`btn-icon ${u.isActive ? 'text-emerald-400' : 'text-slate-500'}`} title="Toggle active">
                        {u.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button onClick={() => {
                        if (confirm(`Delete user "${u.username}"? This cannot be undone.`)) {
                          deleteMutation.mutate(u.id);
                        }
                      }} className="btn-icon text-red-400" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h2 className="text-lg font-semibold text-white">Add New User</h2>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="input-label">Full Name</label>
                <input className="input" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Username</label>
                <input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Password</label>
                <input type="password" className="input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Role</label>
                <select className="select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="BILLING_STAFF">Billing Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="btn-primary flex-1 justify-center">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
