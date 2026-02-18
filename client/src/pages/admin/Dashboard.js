import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

function ExportOrdersButton() {
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    try {
      const res = await api.adminExportOrders({});
      const blob = new Blob([res.data], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `teato-orders-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success('CSV downloaded');
    } catch {
      toast.error('Export failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <button type="button" onClick={onClick} disabled={loading} className="bg-gray-100 hover:bg-gray-200 font-medium py-2 px-4 rounded-xl text-sm">
      {loading ? 'Exporting...' : 'Export orders (CSV)'}
    </button>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ ordersToday: 0, revenueToday: 0, pendingOrders: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminDashboard()
      .then(({ data }) => setStats(data.stats || {}))
      .catch(() => toast.error('Could not load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  const cards = [
    { label: 'Orders today', value: stats.ordersToday, link: '/admin/orders' },
    { label: 'Revenue today', value: `₹${stats.revenueToday?.toFixed(0) || 0}` },
    { label: 'Pending orders', value: stats.pendingOrders, link: '/admin/orders?status=pending' },
    { label: 'Total orders', value: stats.totalOrders, link: '/admin/orders' },
  ];

  return (
    <>
      <Helmet><title>Dashboard - TEATO Admin</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card p-6">
            <p className="text-gray-600 text-sm font-medium">{c.label}</p>
            {c.link ? (
              <Link to={c.link} className="text-2xl font-bold text-teato-600 hover:underline">{c.value}</Link>
            ) : (
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            )}
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-2">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/orders" className="btn-primary py-2 px-4 text-sm">View all orders</Link>
          <Link to="/admin/menu" className="btn-secondary py-2 px-4 text-sm">Manage menu</Link>
          <ExportOrdersButton />
        </div>
      </div>
    </>
  );
}
