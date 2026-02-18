import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

export default function BannersManage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '', linkText: '', type: 'banner', sortOrder: 0, isActive: true });

  const load = () => {
    api.adminBanners().then(({ data }) => setList(data.banners || [])).catch(() => toast.error('Could not load')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.adminUpdateBanner(editing._id, form);
        toast.success('Updated');
      } else {
        await api.adminCreateBanner(form);
        toast.success('Created');
      }
      setModal(false);
      setEditing(null);
      setForm({ title: '', subtitle: '', image: '', link: '', linkText: '', type: 'banner', sortOrder: 0, isActive: true });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await api.adminDeleteBanner(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error('Failed');
    }
  };

  return (
    <>
      <Helmet><title>Banners - TEATO Admin</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Homepage banners</h1>
      <p className="text-gray-600 text-sm mb-4">Use type "hero" for the main homepage hero section. Use "promo" or "banner" for other content.</p>
      <button onClick={() => { setEditing(null); setForm({ title: '', subtitle: '', image: '', link: '', linkText: '', type: 'banner', sortOrder: 0, isActive: true }); setModal(true); }} className="btn-primary mb-6">Add banner</button>
      {loading ? <p className="text-gray-500">Loading...</p> : (
        <ul className="space-y-4">
          {list.map((b) => (
            <li key={b._id} className="card p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{b.title || '(No title)'}</p>
                <p className="text-gray-500 text-sm">{b.type} • {b.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(b); setForm({ title: b.title ?? '', subtitle: b.subtitle ?? '', image: b.image ?? '', link: b.link ?? '', linkText: b.linkText ?? '', type: b.type ?? 'banner', sortOrder: b.sortOrder ?? 0, isActive: b.isActive !== false }); setModal(true); }} className="text-teato-600 text-sm">Edit</button>
                <button onClick={() => remove(b._id)} className="text-red-600 text-sm">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-lg mb-4">{editing ? 'Edit' : 'New'} banner</h3>
            <form onSubmit={save} className="space-y-4">
              <select className="input-field" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="hero">Hero (homepage main)</option>
                <option value="promo">Promo</option>
                <option value="banner">Banner</option>
              </select>
              <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              <input className="input-field" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} />
              <input className="input-field" placeholder="Image URL" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
              <input className="input-field" placeholder="Link URL" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} />
              <input className="input-field" placeholder="Link text" value={form.linkText} onChange={(e) => setForm((f) => ({ ...f, linkText: e.target.value }))} />
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
