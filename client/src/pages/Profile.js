import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.updateProfile({ name: name.trim(), phone: phone.trim() });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Profile - TEATO</title></Helmet>
      <h1 className="text-2xl font-bold text-premium-text mb-6">Profile</h1>
      <form onSubmit={handleSubmit} className="card-premium p-6 space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-premium-muted mb-1">Email</label>
          <p className="text-premium-muted">{user?.email}</p>
        </div>
        <div>
          <label htmlFor="profile-name" className="block text-sm font-medium text-premium-muted mb-1">Name</label>
          <input id="profile-name" type="text" className="input-premium" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="profile-phone" className="block text-sm font-medium text-premium-muted mb-1">Phone</label>
          <input id="profile-phone" type="tel" className="input-premium" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <button type="submit" className="btn-premium" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      </form>
    </>
  );
}
