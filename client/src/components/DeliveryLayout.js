import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DeliveryLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/delivery" className="font-bold text-teato-600">TEATO Delivery</Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <Link to="/" className="text-sm text-gray-500 hover:text-teato-600">Storefront</Link>
            <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
