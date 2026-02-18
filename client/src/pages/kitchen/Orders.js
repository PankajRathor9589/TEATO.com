import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../../services/api';
import { useSocket, useSocketJoinRoom } from '../../hooks/useSocket';

function useNewOrderAlert() {
  const [flash, setFlash] = useState(false);
  const audioRef = useRef(null);

  useSocket('order:new', (data) => {
    if (data.playSound) {
      setFlash(true);
      setTimeout(() => setFlash(false), 2500);
      try {
        if (typeof Audio !== 'undefined') {
          const a = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUtvT18=');
          a.volume = 0.5;
          a.play().catch(() => {});
        }
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('New order!', { body: data.order?.orderId || 'New order received' });
        }
      } catch (_) {}
    }
  });

  return flash;
}

export default function KitchenOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const flash = useNewOrderAlert();

  useSocketJoinRoom('kitchen');
  useSocket('order:new', () => load());
  useSocket('order:updated', () => load());

  const load = () => {
    api.kitchenGetOrders()
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status, estimatedPrepMinutes) => {
    try {
      await api.kitchenUpdateOrderStatus(id, { status, estimatedPrepMinutes });
      load();
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const pending = orders.filter((o) => o.status === 'pending');
  const active = orders.filter((o) => ['accepted', 'preparing'].includes(o.status));

  return (
    <>
      <Helmet><title>Incoming Orders - TEATO Kitchen</title></Helmet>
      {flash && (
        <div className="fixed inset-0 bg-red-500/20 pointer-events-none z-50 flex items-center justify-center animate-pulse" aria-live="assertive">
          <div className="bg-red-500 text-white text-2xl font-bold px-8 py-4 rounded-2xl shadow-lg">NEW ORDER!</div>
        </div>
      )}
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Incoming orders</h1>
      <p className="text-gray-600 text-sm mb-6">Accept and update status. New orders trigger sound and visual alert.</p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 text-red-600">New — Accept or ignore</h2>
              <div className="space-y-4">
                {pending.map((o) => (
                  <OrderCard key={o._id} order={o} onAccept={() => updateStatus(o._id, 'accepted')} onReject={null} />
                ))}
              </div>
            </section>
          )}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">In progress</h2>
            {active.length === 0 ? (
              <p className="text-gray-500">No orders in progress.</p>
            ) : (
              <div className="space-y-4">
                {active.map((o) => (
                  <OrderCard
                    key={o._id}
                    order={o}
                    onAccept={o.status === 'pending' ? () => updateStatus(o._id, 'accepted') : null}
                    onStatusUpdate={o.status === 'accepted' ? () => updateStatus(o._id, 'preparing') : null}
                    statusLabel={o.status === 'accepted' ? 'Start preparing' : 'Preparing...'}
                    updateStatus={updateStatus}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

function OrderCard({ order, onAccept, onStatusUpdate, statusLabel, updateStatus }) {
  const [prepMins, setPrepMins] = useState(order.estimatedPrepMinutes ?? 15);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <span className="font-bold text-teato-600">{order.orderId}</span>
        <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
      </div>
      {order.estimatedPrepMinutes != null && (
        <p className="text-sm text-teato-600 font-medium mb-2">⏱ Est. prep: {order.estimatedPrepMinutes} min</p>
      )}
      <ul className="text-gray-700 text-sm space-y-1 mb-3">
        {(order.items || []).map((i, idx) => (
          <li key={idx}>{i.name} × {i.quantity}</li>
        ))}
      </ul>
      <p className="text-gray-600 text-sm mb-3">
        {order.deliveryAddress?.line1}, {order.deliveryAddress?.pincode}
      </p>
      {order.deliveryAddress?.instructions && (
        <p className="text-sm text-amber-700 mb-3">Note: {order.deliveryAddress.instructions}</p>
      )}
      {onStatusUpdate && (
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm text-gray-600">Prep time (min):</label>
          <input type="number" min={5} max={60} value={prepMins} onChange={(e) => setPrepMins(Number(e.target.value))} className="w-16 rounded border border-gray-300 px-2 py-1 text-sm" />
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {onAccept && <button onClick={onAccept} className="btn-primary py-2 px-4 text-sm">Accept</button>}
        {onStatusUpdate && (
          <button onClick={() => updateStatus(order._id, order.status === 'accepted' ? 'preparing' : 'preparing', prepMins)} className="btn-secondary py-2 px-4 text-sm">{statusLabel}</button>
        )}
      </div>
    </div>
  );
}
