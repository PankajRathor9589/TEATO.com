import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  { value: 'admin', label: 'Admin / Manager' },
  { value: 'kitchen', label: 'Kitchen Staff' },
  { value: 'delivery', label: 'Delivery Staff' },
];

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal] = useState(null); // 'create' | { user } for edit
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'admin' });
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: 'admin', isActive: true });
  const [submitting, setSubmitting] = useState(false);

  const isOwner = currentUser?.role === 'owner';

  const load = () => {
    setLoading(true);
    api.adminListUsers({ role: roleFilter || undefined })
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => toast.error('Could not load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOwner) load();
  }, [isOwner, roleFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password || form.password.length < 6) {
      toast.error('Name, email and password (min 6 characters) required');
      return;
    }
    setSubmitting(true);
    try {
      await api.adminCreateUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        role: form.role,
      });
      toast.success('User created');
      setModal(null);
      setForm({ name: '', email: '', password: '', phone: '', role: 'admin' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!modal || !modal._id) return;
    setSubmitting(true);
    try {
      await api.adminUpdateUser(modal._id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || undefined,
        role: editForm.role,
        isActive: editForm.isActive,
      });
      toast.success('User updated');
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOwner) {
    return (
      <>
        <Helmet><title>Users - TEATO Admin</title></Helmet>
        <p className="text-gray-600">Only the owner can manage users.</p>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Users - TEATO Admin</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User management</h1>
      <p className="text-gray-600 mb-4">Manage admins, kitchen staff, and delivery partners. Only the owner can access this page.</p>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-gray-300 px-4 py-2"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
          <option value="user">Customer</option>
          <option value="owner">Owner</option>
        </select>
        <button type="button" onClick={() => setModal('create')} className="btn-primary py-2 px-4">
          Add user
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Role</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">{u.isActive !== false ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-3">
                    {u.role !== 'owner' && (
                      <button
                        type="button"
                        onClick={() => {
                          setModal(u);
                          setEditForm({ name: u.name, phone: u.phone || '', role: u.role, isActive: u.isActive !== false });
                        }}
                        className="text-teato-600 font-medium hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="p-6 text-gray-500">No users found.</p>}
        </div>
      )}

      {modal === 'create' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Add user</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input className="input-field" placeholder="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              <input type="email" className="input-field" placeholder="Email *" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              <input type="password" className="input-field" placeholder="Password (min 6) *" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={6} />
              <input type="tel" className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              <select className="input-field" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal && modal !== 'create' && modal._id && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Edit user</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input className="input-field" placeholder="Name *" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} required />
              <p className="text-gray-500 text-sm">Email: {modal.email}</p>
              <input type="tel" className="input-field" placeholder="Phone" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
              <select className="input-field" value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))} />
                <span>Active</span>
              </label>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
