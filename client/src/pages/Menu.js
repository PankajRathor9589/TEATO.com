import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../services/api';
import { useCart } from '../context/CartContext';
import ReviewsModal from '../components/ReviewsModal';
import AddItemModal from '../components/AddItemModal';
import { getItemImage } from '../utils/defaultImages';

export default function Menu() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewsFor, setReviewsFor] = useState(null);
  const [addItemFor, setAddItemFor] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    api.getCategories().then(({ data }) => setCategories(data.categories || [])).catch(() => toast.error('Could not load categories'));
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getMenuItems({ category: selectedCategory || undefined, search: search || undefined })
      .then(({ data }) => setItems(data.items || []))
      .catch(() => toast.error('Could not load menu'))
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  const handleAddClick = (item) => {
    const hasAddons = item.customizations?.length > 0;
    if (hasAddons) {
      setAddItemFor(item);
    } else {
      addItem({ menuItem: item._id, name: item.name, price: item.price, image: item.image });
      toast.success(`Added ${item.name}`);
    }
  };

  return (
    <>
      <Helmet><title>Menu - TEATO</title></Helmet>
      <h1 className="text-2xl font-bold text-premium-text mb-4">Menu</h1>
      <div className="mb-4">
        <input type="search" placeholder="Search dishes..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-premium" aria-label="Search menu" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        <button onClick={() => setSelectedCategory('')} className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${!selectedCategory ? 'bg-premium-accent text-white' : 'bg-white/10 text-premium-muted hover:text-premium-text'}`}>All</button>
        {categories.map((c) => (
          <button key={c._id} onClick={() => setSelectedCategory(c._id)} className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${selectedCategory === c._id ? 'bg-premium-accent text-white' : 'bg-white/10 text-premium-muted hover:text-premium-text'}`}>{c.name}</button>
        ))}
      </div>
      {loading ? (
        <p className="text-premium-muted">Loading menu...</p>
      ) : items.length === 0 ? (
        <p className="text-premium-muted">No items found.</p>
      ) : (
        <ul className="space-y-6">
          {items.map((item) => (
            <li key={item._id} id={highlightId === item._id ? 'highlight' : undefined} className={`card-premium overflow-hidden ${highlightId === item._id ? 'ring-2 ring-premium-accent' : ''}`}>
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-48 h-48 sm:h-40 flex-shrink-0 bg-white/5">
                  <img src={getItemImage(item)} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={item.veg ? 'text-green-400' : 'text-red-400'}>{item.veg ? '🟢' : '🔴'}</span>
                      <h2 className="font-semibold text-premium-text text-lg">{item.name}</h2>
                      {item.avgRating > 0 && (
                        <span className="inline-flex items-center gap-0.5 bg-white/10 text-premium-muted text-sm px-2 py-0.5 rounded">★ {item.avgRating} {item.reviewCount ? `(${item.reviewCount})` : ''}</span>
                      )}
                    </div>
                    {item.description && <p className="text-premium-muted text-sm mt-1">{item.description}</p>}
                    {item.customizations?.length > 0 && <p className="text-premium-muted/80 text-xs mt-1">Customizable — add-ons available</p>}
                    <p className="text-premium-accent font-bold text-lg mt-1">₹{item.price}{item.customizations?.length ? '+' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button type="button" onClick={() => setReviewsFor({ id: item._id, name: item.name })} className="border border-white/20 text-premium-text hover:bg-white/10 font-medium py-2 px-4 rounded-xl text-sm transition-colors">Reviews</button>
                    <button type="button" onClick={() => handleAddClick(item)} className="btn-premium py-2 px-5 text-sm">Add to cart</button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {reviewsFor && <ReviewsModal menuItemId={reviewsFor.id} itemName={reviewsFor.name} onClose={() => setReviewsFor(null)} />}
      {addItemFor && <AddItemModal item={addItemFor} onClose={() => setAddItemFor(null)} />}
    </>
  );
}
