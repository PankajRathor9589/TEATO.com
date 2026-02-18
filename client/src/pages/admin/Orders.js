import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

const STATUS_OPTIONS = ['pending', 'accepted', 'rejected', 'preparing', 'out_for_delivery', 'delivered'];

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [assignDeliveryPerson, setAssignDeliveryPerson] = useState('');

  useEffect(() => {
    api.adminDeliveryUsers().then(({ data }) => setDeliveryUsers(data.deliveryUsers || [])).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    api.adminOrders(params)
      .then(({ data }) => {
        setOrders(data.orders || []);
        setTotal(data.total ?? 0);
      })
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const updateStatus = async (id, status, rejectedReason, deliveryPerson) => {
    setUpdating(id);
    try {
      await api.adminUpdateOrderStatus(id, { status, rejectedReason, deliveryPerson: deliveryPerson || undefined });
      load();
      setAssignOrderId(null);
      setAssignDeliveryPerson('');
      toast.success('Order updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <Helmet><title>Orders - TEATO Admin</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setSearchParams(e.target.value ? { status: e.target.value } : {})}
          className="input-field w-auto"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="card p-4">
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <Link to={`/track/${o.orderId}`} className="font-semibold text-teato-600" target="_blank" rel="noopener noreferrer">{o.orderId}</Link>
                <span className="px-2 py-0.5 rounded text-sm bg-gray-100">{o.status}</span>
              </div>
              <p className="text-gray-600 text-sm">{new Date(o.createdAt).toLocaleString()}</p>
              <p className="text-sm">Customer: {o.guestName || o.user?.name || '—'} • {o.guestPhone || o.user?.phone || '—'}</p>
              <p className="font-semibold">₹{o.total?.toFixed(0)}</p>
              {o.status === 'pending' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => updateStatus(o._id, 'accepted')} className="btn-primary py-2 px-4 text-sm" disabled={updating === o._id}>Accept</button>
                  <button onClick={() => updateStatus(o._id, 'rejected', 'Rejected by restaurant')} className="bg-red-500 text-white py-2 px-4 rounded-xl text-sm hover:bg-red-600" disabled={updating === o._id}>Reject</button>
                </div>
              )}
              {['accepted', 'preparing', 'out_for_delivery'].includes(o.status) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {o.status === 'accepted' && <button onClick={() => updateStatus(o._id, 'preparing')} className="btn-secondary py-2 px-4 text-sm" disabled={updating === o._id}>Preparing</button>}
                  {o.status === 'preparing' && (
                    assignOrderId === o._id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={assignDeliveryPerson}
                          onChange={(e) => setAssignDeliveryPerson(e.target.value)}
                          className="input-field w-auto py-2 text-sm"
                        >
                          <option value="">Select delivery partner</option>
                          {deliveryUsers.map((u) => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                          ))}
                        </select>
                        <button onClick={() => updateStatus(o._id, 'out_for_delivery', null, assignDeliveryPerson || undefined)} className="btn-primary py-2 px-4 text-sm" disabled={updating === o._id}>Assign & send</button>
                        <button onClick={() => setAssignOrderId(null)} className="btn-secondary py-2 px-4 text-sm">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setAssignOrderId(o._id)} className="btn-secondary py-2 px-4 text-sm">Out for delivery</button>
                    )
                  )}
                  {o.status === 'out_for_delivery' && <button onClick={() => updateStatus(o._id, 'delivered')} className="btn-primary py-2 px-4 text-sm" disabled={updating === o._id}>Mark delivered</button>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
