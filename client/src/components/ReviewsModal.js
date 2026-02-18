import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ReviewsModal({ menuItemId, itemName, onClose }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!menuItemId) return;
    api.getReviewsByMenuItem(menuItemId)
      .then(({ data }) => setReviews(data.reviews || []))
      .catch(() => toast.error('Could not load reviews'))
      .finally(() => setLoading(false));
  }, [menuItemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to leave a review');
      return;
    }
    setSubmitting(true);
    try {
      await api.addReview({ menuItemId, rating, comment });
      setComment('');
      api.getReviewsByMenuItem(menuItemId).then(({ data }) => setReviews(data.reviews || []));
      toast.success('Review saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-premium-card border border-white/10 rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col shadow-card-hover" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-bold text-premium-text">Reviews — {itemName}</h3>
          <button type="button" onClick={onClose} className="text-premium-muted hover:text-premium-text text-2xl leading-none">&times;</button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {user && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <label className="block text-sm font-medium text-premium-muted mb-2">Your rating</label>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onClick={() => setRating(r)} className={`text-2xl ${r <= rating ? 'text-amber-400' : 'text-premium-muted/50'}`}>★</button>
                ))}
              </div>
              <textarea className="input-premium mb-3" rows={2} placeholder="Your review (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
              <button type="submit" className="btn-premium w-full" disabled={submitting}>{submitting ? 'Saving...' : 'Submit review'}</button>
            </form>
          )}
          <h4 className="font-semibold text-premium-text mb-2">All reviews</h4>
          {loading ? (
            <p className="text-premium-muted">Loading...</p>
          ) : reviews.length === 0 ? (
            <p className="text-premium-muted">No reviews yet.</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r._id} className="border-b border-white/10 pb-3 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <span className="font-medium text-premium-text">{r.user?.name || 'Customer'}</span>
                  </div>
                  {r.comment && <p className="text-premium-muted text-sm mt-1">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
