import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

export default function AnalyticsAdvanced() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState({ revenueTrend: [], peakHours: [], bestSellingItems: [], retention: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.adminAdvancedAnalytics({ days })
      .then(({ data: d }) => setData({ revenueTrend: d.revenueTrend || [], peakHours: d.peakHours || [], bestSellingItems: d.bestSellingItems || [], retention: d.retention || {} }))
      .catch(() => toast.error('Could not load analytics'))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <>
      <Helmet><title>Advanced Analytics - TEATO Admin</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Advanced analytics</h1>
      <div className="mb-4">
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="input-field w-auto">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <h3 className="text-gray-600 text-sm font-medium">Revenue trend</h3>
          <p className="text-2xl font-bold text-teato-600 mt-1">
            ₹{data.revenueTrend.reduce((s, d) => s + (d.revenue || 0), 0).toFixed(0)}
          </p>
          <p className="text-sm text-gray-500">{data.revenueTrend.length} days</p>
        </div>
        <div className="card p-6">
          <h3 className="text-gray-600 text-sm font-medium">Peak hours</h3>
          <ul className="mt-2 space-y-1">
            {data.peakHours.slice(0, 3).map((h) => (
              <li key={h.hour}>{h.hour}:00 — {h.count} orders</li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="text-gray-600 text-sm font-medium">Customer retention</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.retention.retentionRate ?? 0}%</p>
          <p className="text-sm text-gray-500">{data.retention.returningCustomers ?? 0} returning / {data.retention.totalCustomersWithOrders ?? 0} total</p>
        </div>
      </div>
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Revenue by day</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="text-left py-2">Date</th><th className="text-right">Revenue</th><th className="text-right">Orders</th></tr></thead>
            <tbody>
              {data.revenueTrend.slice(-14).reverse().map((d) => (
                <tr key={d._id} className="border-t border-gray-100"><td className="py-2">{d._id}</td><td className="text-right font-medium">₹{d.revenue?.toFixed(0)}</td><td className="text-right">{d.orders}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Best-selling items</h3>
        <ul className="space-y-2">
          {data.bestSellingItems.map((i, idx) => (
            <li key={i._id || idx} className="flex justify-between"><span>{i.name}</span><span>{i.qty} sold</span></li>
          ))}
        </ul>
      </div>
    </>
  );
}
