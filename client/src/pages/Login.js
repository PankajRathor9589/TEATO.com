import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Email and password required');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back!');
      navigate(redirect);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Login - TEATO</title></Helmet>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-premium-text mb-6">Login</h1>
        <form onSubmit={handleSubmit} className="card-premium p-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-premium-muted mb-1">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className="input-premium"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-premium-muted mb-1">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className="input-premium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-premium w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-premium-muted mt-4">
          Don't have an account? <Link to="/register" className="text-premium-accent font-medium hover:underline">Register</Link>
        </p>
      </div>
    </>
  );
}
