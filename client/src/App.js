import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Addresses from './pages/Addresses';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminMenu from './pages/admin/Menu';
import AdminZones from './pages/admin/Zones';
import AdminCustomers from './pages/admin/Customers';
import AdminRevenue from './pages/admin/Revenue';
import AdminCoupons from './pages/admin/Coupons';
import AdminAnalyticsAdvanced from './pages/admin/AnalyticsAdvanced';
import AdminTestimonials from './pages/admin/TestimonialsManage';
import AdminBanners from './pages/admin/BannersManage';
import AdminUsers from './pages/admin/Users';

import KitchenLayout from './components/KitchenLayout';
import KitchenOrders from './pages/kitchen/Orders';

import DeliveryLayout from './components/DeliveryLayout';
import DeliveryMyDeliveries from './pages/delivery/MyDeliveries';

import { useAuth } from './context/AuthContext';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user || (user.role !== 'admin' && user.role !== 'owner')) return <Navigate to="/" replace />;
  return children;
}

function KitchenRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user || (user.role !== 'kitchen' && user.role !== 'admin' && user.role !== 'owner')) return <Navigate to="/" replace />;
  return children;
}

function DeliveryRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user || (user.role !== 'delivery' && user.role !== 'admin' && user.role !== 'owner')) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="track/:orderId" element={<TrackOrder />} />
          <Route path="orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="addresses" element={<PrivateRoute><Addresses /></PrivateRoute>} />
        </Route>
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="zones" element={<AdminZones />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="analytics" element={<AdminAnalyticsAdvanced />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
        <Route path="/kitchen" element={<KitchenRoute><KitchenLayout /></KitchenRoute>}>
          <Route index element={<KitchenOrders />} />
        </Route>
        <Route path="/delivery" element={<DeliveryRoute><DeliveryLayout /></DeliveryRoute>}>
          <Route index element={<DeliveryMyDeliveries />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
