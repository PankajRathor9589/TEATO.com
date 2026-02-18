import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error('Name, email and password required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, phone.trim() || undefined);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Register - TEATO</title></Helmet>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-premium-text mb-6">Create account</h1>
        <form onSubmit={handleSubmit} className="card-premium p-6 space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-premium-muted mb-1">Name</label>
            <input id="reg-name" type="text" className="input-premium" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-premium-muted mb-1">Email</label>
            <input id="reg-email" type="email" autoComplete="email" className="input-premium" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="reg-phone" className="block text-sm font-medium text-premium-muted mb-1">Phone (optional)</label>
            <input id="reg-phone" type="tel" className="input-premium" placeholder="10-digit mobile" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-premium-muted mb-1">Password</label>
            <input id="reg-password" type="password" autoComplete="new-password" className="input-premium" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-premium w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-premium-muted mt-4">
          Already have an account? <Link to="/login" className="text-premium-accent font-medium hover:underline">Login</Link>
        </p>
      </div>
    </>
  );
}
