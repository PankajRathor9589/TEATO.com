import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminCustomers()
      .then(({ data }) => setCustomers(data.customers || []))
      .catch(() => toast.error('Could not load customers'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <>
      <Helmet><title>Customers - TEATO Admin</title></Helmet>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customers</h1>
      {customers.length === 0 ? (
        <p className="text-gray-500">No customers yet.</p>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-900">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Email</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Phone</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3">{c.email}</td>
                    <td className="px-4 py-3">{c.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
