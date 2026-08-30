'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLES = ['Admin', 'Content Manager', 'Instructor', 'Student'];

export default function UserManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: any[];
  currentUserId: number;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', role: 'Instructor' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({ username: '', email: '', password: '', fullName: '', role: 'Instructor' });
      setShowForm(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRoleChange(userId: number, role: string) {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    router.refresh();
  }

  async function handleDelete(userId: number) {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Users</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-slate-900 font-medium underline"
        >
          {showForm ? 'Cancel' : '+ Create User'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Full name" value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input required placeholder="Username" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input required type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input required type="password" placeholder="Password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={submitting}
            className="bg-slate-900 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-slate-800 disabled:opacity-50">
            {submitting ? 'Creating…' : 'Create User'}
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{u.fullName || u.username}</p>
              <p className="text-xs text-slate-500">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={u.role?.name}
                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                className="text-sm rounded-md border border-slate-300 px-2 py-1"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {u.id !== currentUserId && (
                <button onClick={() => handleDelete(u.id)} className="text-xs text-red-600 hover:underline">
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}