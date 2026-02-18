import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../services/api';
import { useCart } from '../context/CartContext';

export default function MyOrders() {
  const navigate = useNavigate();
  const { addItem, clearCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyOrders()
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleReorder = (order) => {
    clearCart();
    (order.items || []).forEach((i) => {
      addItem({
        menuItem: i.menuItem,
        name: i.name,
        price: i.price,
        image: i.image,
        quantity: i.quantity,
      });
    });
    toast.success('Items added to cart');
    navigate('/cart');
  };

  if (loading) return <p className="text-premium-muted">Loading orders...</p>;

  return (
    <>
      <Helmet><title>My Orders - TEATO</title></Helmet>
      <h1 className="text-2xl font-bold text-premium-text mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-premium-muted">No orders yet. <Link to="/menu" className="text-premium-accent font-medium hover:underline">Order now</Link></p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o._id} className="card-premium p-4">
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <Link to={`/track/${o.orderId}`} className="font-semibold text-premium-accent">{o.orderId}</Link>
                <span className={`px-2 py-0.5 rounded text-sm ${
                  o.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                  o.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-premium-muted'
                }`}>
                  {o.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-premium-muted text-sm">{new Date(o.createdAt).toLocaleString()}</p>
              <p className="font-semibold text-premium-text mt-1">₹{o.total?.toFixed(0)}</p>
              <div className="mt-3 flex gap-2">
                <Link to={`/track/${o.orderId}`} className="border border-white/20 text-premium-text hover:bg-white/10 font-medium py-2 px-4 rounded-xl text-sm">Track</Link>
                {o.status === 'delivered' && (
                  <button type="button" onClick={() => handleReorder(o)} className="btn-premium py-2 px-4 text-sm">Reorder</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
