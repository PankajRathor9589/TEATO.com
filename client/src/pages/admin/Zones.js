import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

export default function AdminZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', pincodes: '', deliveryFee: 0, minOrderAmount: 0, estimatedMinutes: 45 });

  const load = () => {
    api.adminZones()
      .then(({ data }) => setZones(data.zones || []))
      .catch(() => toast.error('Could not load zones'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pincodes = form.pincodes.split(/[\s,]+/).map((p) => p.trim()).filter(Boolean);
    const payload = {
      name: form.name,
      pincodes,
      deliveryFee: Number(form.deliveryFee) || 0,
      minOrderAmount: Number(form.minOrderAmount) || 0,
      estimatedMinutes: Number(form.estimatedMinutes) || 45,
      isActive: true,
    };
    try {
      if (editing) {
        await api.adminUpdateZone(editing._id, payload);
        toast.success('Zone updated');
      } else {
        await api.adminCreateZone(payload);
        toast.success('Zone created');
      }
      setModal(false);
      setEditing(null);
      setForm({ name: '', pincodes: '', deliveryFee: 0, minOrderAmount: 0, estimatedMinutes: 45 });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const deleteZone = async (id) => {
    if (!window.confirm('Delete this zone?')) return;
    try {
      await api.adminDeleteZone(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const openEdit = (z) => {
    setEditing(z);
    setForm({
      name: z.name,
      pincodes: (z.pincodes || []).join(', '),
      deliveryFee: z.deliveryFee ?? 0,
      minOrderAmount: z.minOrderAmount ?? 0,
      estimatedMinutes: z.estimatedMinutes ?? 45,
    });
    setModal(true);
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <>
      <Helmet><title>Delivery Zones - TEATO Admin</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Delivery Zones</h1>
      <ul className="space-y-4 mb-6">
        {zones.map((z) => (
          <li key={z._id} className="card p-4 flex justify-between items-start">
            <div>
              <p className="font-semibold">{z.name}</p>
              <p className="text-gray-600 text-sm">Pincodes: {(z.pincodes || []).join(', ')}</p>
              <p className="text-sm">Fee: ₹{z.deliveryFee} • Min order: ₹{z.minOrderAmount} • ~{z.estimatedMinutes} min</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(z)} className="text-teato-600 text-sm font-medium">Edit</button>
              <button onClick={() => deleteZone(z._id)} className="text-red-600 text-sm font-medium">Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => { setEditing(null); setForm({ name: '', pincodes: '', deliveryFee: 0, minOrderAmount: 0, estimatedMinutes: 45 }); setModal(true); }} className="btn-primary">
        Add zone
      </button>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-lg mb-4">{editing ? 'Edit zone' : 'New zone'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="input-field" placeholder="Zone name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              <input className="input-field" placeholder="Pincodes (comma or space separated)" value={form.pincodes} onChange={(e) => setForm((f) => ({ ...f, pincodes: e.target.value }))} />
              <input type="number" className="input-field" placeholder="Delivery fee" value={form.deliveryFee} onChange={(e) => setForm((f) => ({ ...f, deliveryFee: e.target.value }))} />
              <input type="number" className="input-field" placeholder="Min order amount" value={form.minOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))} />
              <input type="number" className="input-field" placeholder="Est. minutes" value={form.estimatedMinutes} onChange={(e) => setForm((f) => ({ ...f, estimatedMinutes: e.target.value }))} />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
