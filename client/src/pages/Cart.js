import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, cartTotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <>
        <Helmet><title>Cart - TEATO</title></Helmet>
        <div className="text-center py-12">
          <p className="text-premium-muted text-lg mb-6">Your cart is empty.</p>
          <Link to="/menu" className="btn-premium">Browse Menu</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Cart - TEATO</title></Helmet>
      <h1 className="text-2xl font-bold text-premium-text mb-6">Your Cart</h1>
      <ul className="space-y-4 mb-8">
        {items.map((i, idx) => (
          <li key={i.menuItem + '-' + idx + '-' + JSON.stringify(i.addons || [])} className="card-premium p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-premium-text">{i.name}</h2>
              {i.addons?.length > 0 && <p className="text-premium-muted text-sm">{i.addons.map((a) => `${a.name}: ${a.optionName}`).join(', ')}</p>}
              <p className="text-premium-accent font-medium">₹{i.price} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(i.menuItem, i.quantity - 1, i.addons)} className="w-10 h-10 rounded-lg border border-white/20 font-bold text-premium-text hover:bg-white/10" aria-label="Decrease quantity">−</button>
              <span className="min-w-[2rem] text-center font-semibold text-premium-text" aria-live="polite">{i.quantity}</span>
              <button onClick={() => updateQuantity(i.menuItem, i.quantity + 1, i.addons)} className="w-10 h-10 rounded-lg border border-white/20 font-bold text-premium-text hover:bg-white/10" aria-label="Increase quantity">+</button>
              <button onClick={() => removeItem(i.menuItem, i.addons)} className="text-premium-accent font-medium px-2" aria-label={`Remove ${i.name}`}>Remove</button>
            </div>
            <p className="w-full text-right font-semibold text-premium-text sm:w-auto">₹{(i.price * i.quantity).toFixed(0)}</p>
          </li>
        ))}
      </ul>
      <div className="card-premium p-6 sticky bottom-20">
        <div className="flex justify-between text-lg font-semibold text-premium-text mb-4">
          <span>Subtotal</span>
          <span>₹{cartTotal.toFixed(0)}</span>
        </div>
        <p className="text-premium-muted text-sm mb-4">Delivery fee & taxes calculated at checkout.</p>
        <Link to="/checkout" className="btn-premium w-full block text-center">
          Proceed to Checkout
        </Link>
      </div>
    </>
  );
}
