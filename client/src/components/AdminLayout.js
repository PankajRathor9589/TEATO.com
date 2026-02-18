import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/zones', label: 'Zones' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/revenue', label: 'Revenue' },
  { to: '/admin/coupons', label: 'Coupons' },
  { to: '/admin/testimonials', label: 'Testimonials' },
  { to: '/admin/banners', label: 'Banners' },
  { to: '/admin/users', label: 'Users', ownerOnly: true },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/admin/dashboard" className="font-bold text-teato-600">TEATO Admin</Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Menu"
          >
            ☰
          </button>
          <nav className={`${menuOpen ? 'block' : 'hidden'} md:flex absolute md:relative top-14 left-0 right-0 bg-white md:bg-transparent border-b md:border-0 border-gray-200 md:border-0 p-4 md:p-0`}>
            <ul className="flex flex-col md:flex-row gap-2">
              {NAV.filter((n) => !n.ownerOnly || isOwner).map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg font-medium ${location.pathname === n.to ? 'bg-teato-100 text-teato-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">Storefront</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50">Logout</button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
