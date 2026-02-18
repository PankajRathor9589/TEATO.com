import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

export default function TestimonialsManage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ customerName: '', text: '', rating: 5, sortOrder: 0, isActive: true });

  const load = () => {
    api.adminTestimonials().then(({ data }) => setList(data.testimonials || [])).catch(() => toast.error('Could not load')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.adminUpdateTestimonial(editing._id, form);
        toast.success('Updated');
      } else {
        await api.adminCreateTestimonial(form);
        toast.success('Created');
      }
      setModal(false);
      setEditing(null);
      setForm({ customerName: '', text: '', rating: 5, sortOrder: 0, isActive: true });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await api.adminDeleteTestimonial(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error('Failed');
    }
  };

  return (
    <>
      <Helmet><title>Testimonials - TEATO Admin</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer testimonials</h1>
      <button onClick={() => { setEditing(null); setForm({ customerName: '', text: '', rating: 5, sortOrder: 0, isActive: true }); setModal(true); }} className="btn-primary mb-6">Add testimonial</button>
      {loading ? <p className="text-gray-500">Loading...</p> : (
        <ul className="space-y-4">
          {list.map((t) => (
            <li key={t._id} className="card p-4 flex justify-between items-start">
              <div>
                <p className="font-semibold">{t.customerName}</p>
                <p className="text-gray-600 text-sm">"{t.text}"</p>
                <p className="text-amber-500 text-sm">★ {t.rating}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(t); setForm({ customerName: t.customerName, text: t.text, rating: t.rating ?? 5, sortOrder: t.sortOrder ?? 0, isActive: t.isActive !== false }); setModal(true); }} className="text-teato-600 text-sm">Edit</button>
                <button onClick={() => remove(t._id)} className="text-red-600 text-sm">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-lg mb-4">{editing ? 'Edit' : 'New'} testimonial</h3>
            <form onSubmit={save} className="space-y-4">
              <input className="input-field" placeholder="Customer name" value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} required />
              <textarea className="input-field" rows={3} placeholder="Testimonial text" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} required />
              <input type="number" min={1} max={5} className="input-field" placeholder="Rating" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))} />
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
