import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

export default function MyDeliveries() {
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [performance, setPerformance] = useState({ deliveredCount: 0, avgDeliveryMinutes: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  const loadPending = () => {
    api.deliveryGetPending().then(({ data }) => setPending(data.orders || [])).catch(() => {});
  };

  const loadCompleted = () => {
    api.deliveryGetCompleted({ page: 1, limit: 20 }).then(({ data }) => setCompleted(data.orders || [])).catch(() => {});
  };

  const loadPerf = () => {
    api.deliveryGetPerformance({ days: 30 }).then(({ data }) => setPerformance({ deliveredCount: data.deliveredCount ?? 0, avgDeliveryMinutes: data.avgDeliveryMinutes ?? 0 })).catch(() => {});
  };

  useEffect(() => {
    setLoading(true);
    loadPending();
    loadCompleted();
    loadPerf();
    setLoading(false);
  }, []);

  const confirmDelivery = async (id) => {
    try {
      await api.deliveryConfirm(id);
      loadPending();
      loadCompleted();
      loadPerf();
      toast.success('Delivery confirmed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const mapsUrl = (addr) => {
    const q = [addr?.line1, addr?.city, addr?.pincode].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  };

  const telUrl = (phone) => `tel:${(phone || '').replace(/\D/g, '')}`;

  return (
    <>
      <Helmet><title>My Deliveries - TEATO Delivery</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Delivery dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Deliveries (30d)</p>
          <p className="text-2xl font-bold text-teato-600">{performance.deliveredCount ?? 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Avg delivery time</p>
          <p className="text-2xl font-bold text-gray-900">{performance.avgDeliveryMinutes ?? 0} min</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('pending')} className={`px-4 py-2 rounded-xl font-medium ${tab === 'pending' ? 'bg-teato-500 text-white' : 'bg-gray-100'}`}>Active</button>
        <button onClick={() => setTab('completed')} className={`px-4 py-2 rounded-xl font-medium ${tab === 'completed' ? 'bg-teato-500 text-white' : 'bg-gray-100'}`}>Completed history</button>
      </div>

      {tab === 'pending' && (
        <>
          <p className="text-gray-600 text-sm mb-4">Confirm when delivered. Use Navigate and Call customer as needed.</p>
          {loading ? <p className="text-gray-500">Loading...</p> : pending.length === 0 ? (
            <p className="text-gray-500">No deliveries assigned right now.</p>
          ) : (
            <div className="space-y-4">
              {pending.map((o) => (
                <div key={o._id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-teato-600">{o.orderId}</span>
                    <span className="text-sm text-gray-500">₹{o.total?.toFixed(0)}</span>
                  </div>
                  <p className="text-gray-700 font-medium">{o.guestName || o.user?.name} — {o.guestPhone || o.user?.phone}</p>
                  <p className="text-gray-600 text-sm mt-1">{o.deliveryAddress?.line1}, {o.deliveryAddress?.line2 && `${o.deliveryAddress.line2}, `}{o.deliveryAddress?.city} - {o.deliveryAddress?.pincode}</p>
                  {o.deliveryAddress?.instructions && <p className="text-sm text-amber-700 mt-1">Note: {o.deliveryAddress.instructions}</p>}
                  <ul className="text-gray-600 text-sm mt-2 space-y-0.5">
                    {(o.items || []).map((i, idx) => <li key={idx}>{i.name} × {i.quantity}</li>)}
                  </ul>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <a href={mapsUrl(o.deliveryAddress)} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2 px-4 text-sm">Navigate</a>
                    <a href={telUrl(o.guestPhone || o.user?.phone)} className="bg-gray-100 hover:bg-gray-200 font-medium py-2 px-4 rounded-xl text-sm">Call customer</a>
                    <button onClick={() => confirmDelivery(o._id)} className="btn-primary py-2 px-4 text-sm">Confirm delivered</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'completed' && (
        <>
          <p className="text-gray-600 text-sm mb-4">Your completed deliveries.</p>
          {completed.length === 0 ? (
            <p className="text-gray-500">No completed deliveries in recent history.</p>
          ) : (
            <ul className="space-y-3">
              {completed.map((o) => (
                <li key={o._id} className="card p-3 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-teato-600">{o.orderId}</span>
                    <p className="text-gray-500 text-sm">{o.deliveryAddress?.line1}, {o.deliveryAddress?.pincode}</p>
                    <p className="text-gray-400 text-xs">{o.deliveredAt ? new Date(o.deliveredAt).toLocaleString() : ''}</p>
                  </div>
                  <span className="text-green-600 font-medium">Delivered</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
