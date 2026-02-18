import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../services/api';
import { useSocketOrderRoom } from '../hooks/useSocket';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Received' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const REJECTED_KEY = 'rejected';

export default function TrackOrder() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocketOrderRoom(orderId);

  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      if (data.orderId === orderId) setOrder(data.order);
    };
    socket.on('order:updated', handler);
    return () => socket.off('order:updated', handler);
  }, [socket, orderId]);

  useEffect(() => {
    api.getOrderByOrderId(orderId)
      .then(({ data }) => setOrder(data.order))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <p className="text-premium-muted">Loading order...</p>;
  if (!order) return <div className="text-center py-8"><p className="text-premium-muted">Order not found.</p><Link to="/" className="btn-premium mt-4">Home</Link></div>;

  const currentIndex = order.status === REJECTED_KEY ? -1 : STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isRejected = order.status === 'rejected';

  return (
    <>
      <Helmet><title>Track {order.orderId} - TEATO</title></Helmet>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-premium-text mb-2">Order {order.orderId}</h1>
        <p className="text-premium-muted mb-6">
          {isRejected ? (
            <span className="text-red-400">Order was rejected. {order.rejectedReason || ''}</span>
          ) : (
            <span className="text-premium-accent font-medium">{STATUS_STEPS.find((s) => s.key === order.status)?.label || order.status}</span>
          )}
        </p>

        {!isRejected && (
          <div className="card-premium p-6 mb-8">
            <ul className="space-y-4">
              {STATUS_STEPS.map((step, i) => (
                <li key={step.key} className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                    i < currentIndex ? 'bg-premium-accent text-white' : i === currentIndex ? 'bg-premium-accent text-white ring-4 ring-premium-accent/30' : 'bg-white/10 text-premium-muted'
                  }`}>
                    {i < currentIndex ? '✓' : i + 1}
                  </div>
                  <div>
                    <p className={`font-medium ${i <= currentIndex ? 'text-premium-text' : 'text-premium-muted'}`}>{step.label}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card-premium p-6 mb-6">
          <h2 className="font-semibold text-premium-text mb-3">Order details</h2>
          <ul className="space-y-2 text-premium-muted">
            {order.items?.map((i, idx) => (
              <li key={idx}>{i.name} × {i.quantity} — ₹{(i.price * i.quantity).toFixed(0)}</li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between font-semibold text-premium-text">
            <span>Total</span>
            <span>₹{order.total?.toFixed(0)}</span>
          </div>
        </div>

        <div className="card-premium p-6">
          <h2 className="font-semibold text-premium-text mb-2">Delivery address</h2>
          <p className="text-premium-muted">
            {order.deliveryAddress?.line1}, {order.deliveryAddress?.line2 && `${order.deliveryAddress.line2}, `}
            {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
          </p>
          {order.deliveryAddress?.instructions && <p className="text-premium-muted/80 text-sm mt-1">{order.deliveryAddress.instructions}</p>}
        </div>

        <div className="mt-8 flex gap-4">
          <Link to="/menu" className="border border-white/20 text-premium-text hover:bg-white/10 font-medium py-3 px-6 rounded-xl flex-1 text-center">Order again</Link>
          <Link to="/" className="btn-premium flex-1 text-center">Home</Link>
        </div>
      </div>
    </>
  );
}
