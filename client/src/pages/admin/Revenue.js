import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

export default function AdminRevenue() {
  const [revenue, setRevenue] = useState([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, orderCount: 0 });
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.adminRevenueAnalytics({ startDate, endDate })
      .then(({ data }) => {
        setRevenue(data.revenue || []);
        setSummary(data.summary || {});
      })
      .catch(() => toast.error('Could not load analytics'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [startDate, endDate]);

  return (
    <>
      <Helmet><title>Revenue - TEATO Admin</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Revenue analytics</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field w-auto" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field w-auto" />
        <button onClick={load} className="btn-primary py-2 px-4">Apply</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-gray-600 text-sm font-medium">Total revenue (period)</p>
          <p className="text-2xl font-bold text-teato-600">₹{summary.totalRevenue?.toFixed(0) || 0}</p>
        </div>
        <div className="card p-6">
          <p className="text-gray-600 text-sm font-medium">Orders (period)</p>
          <p className="text-2xl font-bold text-gray-900">{summary.orderCount || 0}</p>
        </div>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : revenue.length === 0 ? (
        <p className="text-gray-500">No data for this period.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-900">Period</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Revenue</th>
                <th className="px-4 py-3 font-semibold text-gray-900">Orders</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((r, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-4 py-3">{r._id?.month ? `${r._id.year}-${String(r._id.month).padStart(2, '0')}${r._id?.day ? `-${String(r._id.day).padStart(2, '0')}` : ''}` : '—'}</td>
                  <td className="px-4 py-3 font-medium">₹{r.totalRevenue?.toFixed(0)}</td>
                  <td className="px-4 py-3">{r.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
