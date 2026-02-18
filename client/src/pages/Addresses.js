import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function Addresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });

  const loadUser = async () => {
    try {
      const { data } = await api.getMe();
      setAddresses(data.user?.addresses || []);
    } catch (_) {}
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.line1?.trim() || !form.city?.trim() || !form.pincode?.trim()) {
      toast.error('Address line, city and pincode required');
      return;
    }
    setLoading(true);
    try {
      await api.addAddress(form);
      await loadUser();
      setShowForm(false);
      setForm({ label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
      toast.success('Address added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      await api.deleteAddress(id);
      await loadUser();
      toast.success('Address removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  return (
    <>
      <Helmet><title>Addresses - TEATO</title></Helmet>
      <h1 className="text-2xl font-bold text-premium-text mb-6">Saved Addresses</h1>
      <ul className="space-y-4 mb-8">
        {addresses.map((addr) => (
          <li key={addr._id} className="card-premium p-4 flex justify-between items-start">
            <div>
              <span className="font-medium text-premium-text">{addr.label}</span>
              <p className="text-premium-muted text-sm mt-1">{addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city} - {addr.pincode}</p>
              {addr.isDefault && <span className="text-premium-accent text-xs font-medium">Default</span>}
            </div>
            <button type="button" onClick={() => handleDelete(addr._id)} className="text-premium-accent text-sm font-medium hover:underline">Remove</button>
          </li>
        ))}
      </ul>
      {!showForm ? (
        <button type="button" onClick={() => setShowForm(true)} className="btn-premium">Add new address</button>
      ) : (
        <form onSubmit={handleSubmit} className="card-premium p-6 space-y-4 max-w-md">
          <h2 className="font-semibold text-premium-text">New address</h2>
          <input className="input-premium" placeholder="Label (e.g. Home)" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
          <input className="input-premium" placeholder="Address line 1 *" value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} required />
          <input className="input-premium" placeholder="Address line 2" value={form.line2} onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))} />
          <input className="input-premium" placeholder="City *" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required />
          <input className="input-premium" placeholder="State" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
          <input className="input-premium" placeholder="Pincode *" value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} required />
          <label className="flex items-center gap-2 text-premium-muted">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
            <span>Set as default</span>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-premium" disabled={loading}>{loading ? 'Adding...' : 'Add'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-white/20 text-premium-text hover:bg-white/10 font-medium py-2 px-4 rounded-xl">Cancel</button>
          </div>
        </form>
      )}
    </>
  );
}
