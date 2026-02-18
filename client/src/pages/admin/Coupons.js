import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    code: '',
    type: 'percent',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    isActive: true,
  });

  const load = () => {
    api.adminCoupons()
      .then(({ data }) => setCoupons(data.coupons || []))
      .catch(() => toast.error('Could not load coupons'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value) || 0,
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      validFrom: form.validFrom || undefined,
      validUntil: form.validUntil || undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      isActive: form.isActive,
    };
    try {
      if (editing) {
        await api.adminUpdateCoupon(editing._id, payload);
        toast.success('Coupon updated');
      } else {
        await api.adminCreateCoupon(payload);
        toast.success('Coupon created');
      }
      setModal(false);
      setEditing(null);
      resetForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const resetForm = () => {
    setForm({
      code: '',
      type: 'percent',
      value: '',
      minOrderAmount: '',
      maxDiscount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      isActive: true,
    });
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.adminDeleteCoupon(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type || 'percent',
      value: c.value ?? '',
      minOrderAmount: c.minOrderAmount ?? '',
      maxDiscount: c.maxDiscount ?? '',
      validFrom: c.validFrom ? new Date(c.validFrom).toISOString().slice(0, 10) : '',
      validUntil: c.validUntil ? new Date(c.validUntil).toISOString().slice(0, 10) : '',
      usageLimit: c.usageLimit ?? '',
      isActive: c.isActive !== false,
    });
    setModal(true);
  };

  return (
    <>
      <Helmet><title>Coupons - TEATO Admin</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Coupon management</h1>
      <button onClick={() => { setEditing(null); resetForm(); setModal(true); }} className="btn-primary mb-6">
        Add coupon
      </button>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : coupons.length === 0 ? (
        <p className="text-gray-500">No coupons yet.</p>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-900">Code</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Type</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Value</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Min order</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Used</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Active</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c._id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-mono">{c.code}</td>
                    <td className="px-4 py-3">{c.type}</td>
                    <td className="px-4 py-3">{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}</td>
                    <td className="px-4 py-3">₹{c.minOrderAmount || 0}</td>
                    <td className="px-4 py-3">{c.usedCount || 0}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                    <td className="px-4 py-3">{c.isActive ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(c)} className="text-teato-600 text-sm font-medium mr-2">Edit</button>
                      <button onClick={() => deleteCoupon(c._id)} className="text-red-600 text-sm font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full my-8">
            <h3 className="font-semibold text-lg mb-4">{editing ? 'Edit coupon' : 'New coupon'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="input-field" placeholder="Code (e.g. TEATO20)" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
              <select className="input-field" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="percent">Percent</option>
                <option value="fixed">Fixed amount</option>
              </select>
              <input type="number" step="0.01" className="input-field" placeholder="Value" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} required />
              <input type="number" className="input-field" placeholder="Min order amount" value={form.minOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))} />
              {form.type === 'percent' && <input type="number" className="input-field" placeholder="Max discount (₹)" value={form.maxDiscount} onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))} />}
              <input type="date" className="input-field" placeholder="Valid from" value={form.validFrom} onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))} />
              <input type="date" className="input-field" placeholder="Valid until" value={form.validUntil} onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))} />
              <input type="number" className="input-field" placeholder="Usage limit (optional)" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))} />
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} /> Active</label>
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
