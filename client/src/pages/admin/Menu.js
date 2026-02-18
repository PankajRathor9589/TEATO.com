import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

export default function AdminMenu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'category' | 'item' | null
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', category: '', price: '', veg: true, isAvailable: true, sortOrder: 0,
    estimatedPrepMinutes: 10,
    customizations: [], // [{ name, required, options: [{ name, price }] }]
  });
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([api.adminCategories(), api.adminMenu()]);
      setCategories(catRes.data.categories || []);
      setItems(itemRes.data.items || []);
    } catch {
      toast.error('Could not load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.adminUpdateCategory(editingCategory._id, { name: form.name, sortOrder: form.sortOrder ?? 0 });
        toast.success('Category updated');
      } else {
        await api.adminCreateCategory({ name: form.name, sortOrder: form.sortOrder ?? 0 });
        toast.success('Category created');
      }
      setModal(null);
      setEditingCategory(null);
      setForm({ name: '', sortOrder: 0 });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const saveItem = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('price', form.price);
      fd.append('veg', form.veg);
      fd.append('isAvailable', form.isAvailable);
      fd.append('sortOrder', form.sortOrder ?? 0);
      fd.append('estimatedPrepMinutes', form.estimatedPrepMinutes ?? 10);
      if (Array.isArray(form.customizations) && form.customizations.length) fd.append('customizations', JSON.stringify(form.customizations));
      if (form.imageFile?.[0]) fd.append('image', form.imageFile[0]);
      if (editingItem) {
        await api.adminUpdateMenuItem(editingItem._id, fd);
        toast.success('Item updated');
      } else {
        await api.adminCreateMenuItem(fd);
        toast.success('Item created');
      }
      setModal(null);
      setEditingItem(null);
      setForm({ name: '', description: '', category: '', price: '', veg: true, isAvailable: true, sortOrder: 0, estimatedPrepMinutes: 10, customizations: [] });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.adminDeleteCategory(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.adminDeleteMenuItem(id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const openCategoryForm = (cat = null) => {
    setEditingCategory(cat);
    setForm({ name: cat?.name ?? '', sortOrder: cat?.sortOrder ?? 0 });
    setModal('category');
  };

  const openItemForm = (item = null) => {
    setEditingItem(item);
    setForm({
      name: item?.name ?? '',
      description: item?.description ?? '',
      category: item?.category?._id ?? item?.category ?? '',
      price: item?.price ?? '',
      veg: item?.veg !== false,
      isAvailable: item?.isAvailable !== false,
      sortOrder: item?.sortOrder ?? 0,
      estimatedPrepMinutes: item?.estimatedPrepMinutes ?? 10,
      customizations: Array.isArray(item?.customizations) ? item.customizations : [],
    });
    setModal('item');
  };

  const addCustomization = () => {
    setForm((f) => ({ ...f, customizations: [...(f.customizations || []), { name: '', required: false, options: [{ name: '', price: 0 }] }] }));
  };
  const removeCustomization = (idx) => {
    setForm((f) => ({ ...f, customizations: f.customizations.filter((_, i) => i !== idx) }));
  };
  const updateCustomization = (idx, field, value) => {
    setForm((f) => {
      const c = [...(f.customizations || [])];
      if (!c[idx]) return f;
      c[idx] = { ...c[idx], [field]: value };
      return { ...f, customizations: c };
    });
  };
  const addOption = (custIdx) => {
    setForm((f) => {
      const c = [...(f.customizations || [])];
      if (!c[custIdx]) return f;
      c[custIdx] = { ...c[custIdx], options: [...(c[custIdx].options || []), { name: '', price: 0 }] };
      return { ...f, customizations: c };
    });
  };
  const removeOption = (custIdx, optIdx) => {
    setForm((f) => {
      const c = [...(f.customizations || [])];
      if (!c[custIdx]?.options) return f;
      c[custIdx] = { ...c[custIdx], options: c[custIdx].options.filter((_, i) => i !== optIdx) };
      return { ...f, customizations: c };
    });
  };
  const updateOption = (custIdx, optIdx, field, value) => {
    setForm((f) => {
      const c = [...(f.customizations || [])];
      if (!c[custIdx]?.options?.[optIdx]) return f;
      c[custIdx].options[optIdx] = { ...c[custIdx].options[optIdx], [field]: field === 'price' ? parseFloat(value) || 0 : value };
      return { ...f, customizations: c };
    });
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <>
      <Helmet><title>Menu - TEATO Admin</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Menu</h1>

      <section className="card p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
        <ul className="space-y-2 mb-4">
          {categories.map((c) => (
            <li key={c._id} className="flex justify-between items-center">
              <span>{c.name}</span>
              <div className="flex gap-2">
                <button onClick={() => openCategoryForm(c)} className="text-teato-600 text-sm font-medium">Edit</button>
                <button onClick={() => deleteCategory(c._id)} className="text-red-600 text-sm font-medium">Delete</button>
              </div>
            </li>
          ))}
        </ul>
        <button onClick={() => openCategoryForm()} className="btn-primary py-2 px-4 text-sm">Add category</button>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Menu items</h2>
        <ul className="space-y-2 mb-4">
          {items.map((i) => (
            <li key={i._id} className="flex justify-between items-center">
              <span>{i.name} — ₹{i.price} {i.isAvailable ? '' : '(unavailable)'}</span>
              <div className="flex gap-2">
                <button onClick={() => openItemForm(i)} className="text-teato-600 text-sm font-medium">Edit</button>
                <button onClick={() => deleteItem(i._id)} className="text-red-600 text-sm font-medium">Delete</button>
              </div>
            </li>
          ))}
        </ul>
        <button onClick={() => openItemForm()} className="btn-primary py-2 px-4 text-sm">Add item</button>
      </section>

      {modal === 'category' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-lg mb-4">{editingCategory ? 'Edit category' : 'New category'}</h3>
            <form onSubmit={saveCategory} className="space-y-4">
              <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              <input type="number" className="input-field" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))} />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'item' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full my-8">
            <h3 className="font-semibold text-lg mb-4">{editingItem ? 'Edit item' : 'New item'}</h3>
            <form onSubmit={saveItem} className="space-y-4">
              <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              <textarea className="input-field" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
              <select className="input-field" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <input type="number" step="0.01" className="input-field" placeholder="Price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.veg} onChange={(e) => setForm((f) => ({ ...f, veg: e.target.checked }))} /> Veg</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))} /> Available</label>
              <input type="number" className="input-field" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prep time (minutes)</label>
                <input type="number" min={5} max={60} className="input-field" value={form.estimatedPrepMinutes} onChange={(e) => setForm((f) => ({ ...f, estimatedPrepMinutes: parseInt(e.target.value, 10) || 10 }))} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Add-ons / variants</label>
                  <button type="button" onClick={addCustomization} className="text-teato-600 text-sm font-medium">+ Add group</button>
                </div>
                {(form.customizations || []).map((cust, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3 mb-2 bg-gray-50">
                    <div className="flex gap-2 items-center mb-2">
                      <input className="input-field flex-1" placeholder="Group name (e.g. Size)" value={cust.name} onChange={(e) => updateCustomization(idx, 'name', e.target.value)} />
                      <label className="flex items-center gap-1 text-sm whitespace-nowrap"><input type="checkbox" checked={!!cust.required} onChange={(e) => updateCustomization(idx, 'required', e.target.checked)} /> Required</label>
                      <button type="button" onClick={() => removeCustomization(idx)} className="text-red-600 text-sm">Remove</button>
                    </div>
                    <div className="space-y-1 ml-2">
                      {(cust.options || []).map((opt, oidx) => (
                        <div key={oidx} className="flex gap-2 items-center">
                          <input className="input-field flex-1" placeholder="Option name" value={opt.name} onChange={(e) => updateOption(idx, oidx, 'name', e.target.value)} />
                          <input type="number" step="0.01" className="input-field w-24" placeholder="+₹" value={opt.price} onChange={(e) => updateOption(idx, oidx, 'price', e.target.value)} />
                          <button type="button" onClick={() => removeOption(idx, oidx)} className="text-red-600 text-sm">×</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addOption(idx)} className="text-teato-600 text-sm">+ Option</button>
                    </div>
                  </div>
                ))}
              </div>
              <input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, imageFile: e.target.files }))} className="input-field" />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary" disabled={uploading}>{uploading ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
