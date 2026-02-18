import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import PushPrompt from './PushPrompt';

export default function Layout() {
  const { user, logout, isAdmin, isKitchen, isDelivery } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isCustomerArea = !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/kitchen') && !location.pathname.startsWith('/delivery');

  useEffect(() => {
    if (isCustomerArea) document.body.classList.add('theme-premium');
    else document.body.classList.remove('theme-premium');
    return () => document.body.classList.remove('theme-premium');
  }, [isCustomerArea]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <div className={`min-h-screen flex flex-col ${isCustomerArea ? 'bg-premium-bg' : 'bg-gray-50'}`}>
      <header className={`sticky top-0 z-40 safe-bottom ${isCustomerArea ? 'bg-premium-card/80 backdrop-blur-xl border-b border-white/5 shadow-card-dark' : 'bg-white border-b border-gray-200 shadow-sm'}`}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <Link
            to="/"
            className={`text-xl font-bold tracking-tight ${isCustomerArea ? 'text-premium-text' : 'text-teato-600'}`}
          >
            TEATO
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/menu"
              className={`px-3 py-2 rounded-xl font-medium transition-colors ${isCustomerArea ? 'text-premium-muted hover:text-premium-text hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
              aria-label="Menu"
            >
              Menu
            </Link>
            <Link
              to="/cart"
              className={`relative px-3 py-2 rounded-xl font-medium transition-colors ${isCustomerArea ? 'text-premium-muted hover:text-premium-text hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
              aria-label="Cart"
            >
              Cart
              {cartCount > 0 && (
                <span className={`absolute top-1 right-1 rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 text-xs font-bold ${isCustomerArea ? 'bg-premium-accent text-white' : 'bg-teato-500 text-white'}`}>
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`px-3 py-2 rounded-xl font-medium transition-colors ${isCustomerArea ? 'text-premium-muted hover:text-premium-text hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
                  aria-expanded={menuOpen}
                  aria-label="Account menu"
                >
                  Account ▼
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                    <div className={`absolute right-0 mt-1 w-48 py-2 rounded-2xl shadow-lg z-20 animate-fade-in ${isCustomerArea ? 'bg-premium-card border border-white/10' : 'bg-white border border-gray-100'}`}>
                      <Link to="/orders" className={`block px-4 py-2.5 hover:bg-white/5 rounded-lg mx-1 ${isCustomerArea ? 'text-premium-muted hover:text-premium-text' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMenuOpen(false)}>
                        My Orders
                      </Link>
                      <Link to="/profile" className={`block px-4 py-2.5 hover:bg-white/5 rounded-lg mx-1 ${isCustomerArea ? 'text-premium-muted hover:text-premium-text' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMenuOpen(false)}>
                        Profile
                      </Link>
                      <Link to="/addresses" className={`block px-4 py-2.5 hover:bg-white/5 rounded-lg mx-1 ${isCustomerArea ? 'text-premium-muted hover:text-premium-text' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMenuOpen(false)}>
                        Addresses
                      </Link>
                      {isAdmin && (
                        <Link to="/admin/dashboard" className={`block px-4 py-2.5 rounded-lg mx-1 ${isCustomerArea ? 'text-premium-accent hover:bg-white/5' : 'text-teato-600 hover:bg-teato-50'}`} onClick={() => setMenuOpen(false)}>
                          Admin
                        </Link>
                      )}
                      {isKitchen && (
                        <Link to="/kitchen" className={`block px-4 py-2.5 rounded-lg mx-1 ${isCustomerArea ? 'text-premium-accent hover:bg-white/5' : 'text-teato-600 hover:bg-teato-50'}`} onClick={() => setMenuOpen(false)}>
                          Kitchen
                        </Link>
                      )}
                      {isDelivery && (
                        <Link to="/delivery" className={`block px-4 py-2.5 rounded-lg mx-1 ${isCustomerArea ? 'text-premium-accent hover:bg-white/5' : 'text-teato-600 hover:bg-teato-50'}`} onClick={() => setMenuOpen(false)}>
                          Delivery
                        </Link>
                      )}
                      <button onClick={handleLogout} className={`block w-full text-left px-4 py-2.5 rounded-lg mx-1 ${isCustomerArea ? 'text-premium-accent hover:bg-white/5' : 'text-red-600 hover:bg-red-50'}`}>
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className={isCustomerArea ? 'btn-premium py-2 px-5 text-sm' : 'btn-primary py-2 px-4 text-sm'}>
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className={`flex-1 w-full mx-auto px-4 py-6 pb-24 safe-bottom ${isCustomerArea ? 'max-w-6xl text-premium-text' : 'max-w-4xl'}`}>
        <Outlet />
      </main>
      {user && <PushPrompt />}
      {isCustomerArea ? (
        <footer className="bg-premium-card border-t border-white/5 py-8 mt-auto">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="font-bold text-premium-text text-lg">TEATO</p>
            <p className="text-premium-muted text-sm mt-1">Premium food, delivered fresh</p>
            <p className="text-premium-muted/80 text-xs mt-3">© {new Date().getFullYear()} TEATO. All rights reserved.</p>
          </div>
        </footer>
      ) : (
        <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-auto">
          <div className="max-w-4xl mx-auto px-4 text-center text-gray-600 text-sm">
            <p className="font-semibold text-teato-600">TEATO</p>
            <p>Order food online • Fast delivery</p>
            <p className="mt-2">© {new Date().getFullYear()} TEATO. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
