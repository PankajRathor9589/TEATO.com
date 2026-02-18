import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import * as api from '../services/api';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getItemImage } from '../utils/defaultImages';

const FLOATING_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80', alt: 'Burger', class: 'top-[12%] left-[8%] w-20 md:w-28 rounded-2xl shadow-card-hover animate-float' },
  { src: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80', alt: 'Pizza', class: 'top-[18%] right-[10%] w-24 md:w-32 rounded-2xl shadow-card-hover animate-float', style: { animationDelay: '1s' } },
  { src: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&q=80', alt: 'Fries', class: 'bottom-[20%] left-[5%] w-16 md:w-20 rounded-2xl shadow-card-hover animate-float', style: { animationDelay: '2s' } },
  { src: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&q=80', alt: 'Drink', class: 'bottom-[15%] right-[8%] w-20 md:w-24 rounded-2xl shadow-card-hover animate-float', style: { animationDelay: '0.5s' } },
];

const FEATURES = [
  { icon: '🚀', title: 'Fast delivery', desc: 'Hot food at your door in 30–45 mins' },
  { icon: '✨', title: 'Premium quality', desc: 'Fresh ingredients, chef-crafted' },
  { icon: '🥗', title: 'Healthy options', desc: 'Nutritious meals for every diet' },
  { icon: '🎉', title: 'Party orders', desc: 'Bulk orders for events & gatherings' },
  { icon: '🏷️', title: 'Special offers', desc: 'Discounts and deals every day' },
  { icon: '🍽️', title: 'Custom meals', desc: 'Add-ons and variants to suit you' },
];

const TRUST_STATS_FALLBACK = { orders: '50K+', items: '100+', rating: '4.8', cities: '10+' };

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setLocation, pincode } = useLocation();
  const { clearCart, addItem } = useCart();
  const [banners, setBanners] = useState([]);
  const [popular, setPopular] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [offers, setOffers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [locationInput, setLocationInput] = useState(pincode || '');
  const [locationModal, setLocationModal] = useState(false);
  const [stats, setStats] = useState(TRUST_STATS_FALLBACK);

  useEffect(() => {
    api.getBanners().then(({ data }) => setBanners(data.banners || [])).catch(() => {});
    api.getPopularItems({ limit: 8 }).then(({ data }) => setPopular(data.items || [])).catch(() => {});
    api.getRecommendedItems({ limit: 6 }).then(({ data }) => setRecommended(data.items || [])).catch(() => {});
    api.getOffers().then(({ data }) => setOffers(data.offers || [])).catch(() => {});
    api.getTestimonials().then(({ data }) => setTestimonials(data.testimonials || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      api.getLastOrder().then(({ data }) => setLastOrder(data.order)).catch(() => setLastOrder(null));
    } else {
      setLastOrder(null);
    }
  }, [user]);

  const handleSetLocation = (e) => {
    e.preventDefault();
    const pin = locationInput.replace(/\D/g, '').slice(0, 6);
    if (pin.length < 5) {
      toast.error('Enter a valid pincode');
      return;
    }
    setLocation({ pincode: pin, label: `Delivery to ${pin}` });
    setLocationModal(false);
    toast.success('Location updated');
  };

  const handleOneClickReorder = () => {
    if (!lastOrder?.items?.length) {
      toast.error('No previous order to reorder');
      return;
    }
    clearCart();
    lastOrder.items.forEach((i) => {
      addItem({
        menuItem: i.menuItem?._id || i.menuItem,
        name: i.name,
        price: i.price,
        image: i.image,
        quantity: i.quantity,
      });
    });
    toast.success('Last order added to cart');
    navigate('/cart');
  };

  const handleAddToCart = (item) => {
    if (item.customizations?.length) {
      navigate(`/menu?highlight=${item._id}`);
      return;
    }
    addItem({
      menuItem: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
    toast.success(`${item.name} added to cart`);
  };

  const heroBanner = banners.find((b) => b.type === 'hero') || null;

  return (
    <>
      <Helmet>
        <title>TEATO - Premium Food Delivery</title>
        <meta name="description" content="Order fresh, premium food from TEATO. Fast delivery, great taste, and exclusive offers." />
      </Helmet>

      {/* Location bar */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setLocationModal(true)}
          className="flex items-center gap-3 w-full text-left rounded-2xl bg-premium-card border border-white/10 px-4 py-3.5 shadow-card-dark hover:shadow-card-hover hover:border-premium-accent/30 transition-all duration-300"
        >
          <span className="text-2xl">📍</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-premium-muted uppercase tracking-wider">Delivery location</p>
            <p className="font-semibold text-premium-text truncate">{pincode ? `Delivery to ${pincode}` : 'Set your location'}</p>
          </div>
          <span className="text-premium-muted">▼</span>
        </button>
      </div>

      {locationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-premium-card rounded-2xl p-6 max-w-sm w-full shadow-card-hover border border-white/10">
            <h3 className="text-lg font-bold text-premium-text mb-2">Where do you want your order?</h3>
            <form onSubmit={handleSetLocation}>
              <input
                type="text"
                placeholder="Enter pincode (e.g. 110001)"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="input-premium mb-4"
                maxLength={6}
              />
              <button type="submit" className="btn-premium w-full">Confirm location</button>
            </form>
            <button type="button" onClick={() => setLocationModal(false)} className="w-full mt-2 text-premium-muted text-sm hover:text-premium-text">Cancel</button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden mb-12 min-h-[340px] md:min-h-[420px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-premium-bg via-premium-card to-premium-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,90,95,0.15),transparent)]" />
        {heroBanner?.image ? (
          <>
            <img src={heroBanner.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-premium-bg/70" />
          </>
        ) : null}
        {/* Floating food images */}
        {!heroBanner?.image && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {FLOATING_IMAGES.map((img, i) => (
              <img key={i} src={img.src} alt={img.alt} className={`absolute object-cover ${img.class}`} style={img.style} />
            ))}
          </div>
        )}
        <div className="relative z-10 text-center px-4 py-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-premium-text tracking-tight">
            {heroBanner?.title || 'TEATO'}
          </h1>
          <p className="text-lg md:text-xl text-premium-muted mt-3 max-w-md mx-auto">
            {heroBanner?.subtitle || 'Premium food, delivered fresh to your door'}
          </p>
          <Link
            to="/menu"
            className="inline-block mt-8 btn-premium text-lg px-10 py-4"
          >
            {heroBanner?.linkText || 'Order Now'}
          </Link>
        </div>
      </section>

      {/* Trust stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        {[
          { value: stats.orders, label: 'Orders delivered', icon: '📦' },
          { value: stats.items, label: 'Menu items', icon: '🍽️' },
          { value: stats.rating, label: 'Customer rating', icon: '⭐' },
          { value: stats.cities, label: 'Cities served', icon: '🏙️' },
        ].map((stat, i) => (
          <div key={i} className="card-premium p-5 text-center hover:shadow-card-hover hover:border-premium-accent/20 transition-all duration-300">
            <span className="text-2xl block mb-2">{stat.icon}</span>
            <p className="text-2xl md:text-3xl font-bold text-premium-text">{stat.value}</p>
            <p className="text-sm text-premium-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* One-click reorder */}
      {user && lastOrder?.items?.length > 0 && (
        <section className="mb-10">
          <div className="card-premium p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-premium-accent/20">
            <div>
              <h2 className="font-bold text-premium-text text-lg">Order again in one tap</h2>
              <p className="text-premium-muted text-sm mt-1">Your last order: {lastOrder.items.map((i) => i.name).join(', ').slice(0, 50)}…</p>
            </div>
            <button type="button" onClick={handleOneClickReorder} className="btn-premium whitespace-nowrap">
              Reorder last order
            </button>
          </div>
        </section>
      )}

      {/* Features grid */}
      <section className="mb-14">
        <h2 className="text-2xl md:text-3xl font-bold text-premium-text mb-6 text-center">Why choose TEATO</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="card-premium p-5 hover:shadow-card-hover hover:border-premium-accent/20 transition-all duration-300 group">
              <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">{f.icon}</span>
              <h3 className="font-semibold text-premium-text">{f.title}</h3>
              <p className="text-sm text-premium-muted mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular items */}
      {popular.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-premium-text mb-6">Popular on TEATO</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popular.map((item) => (
              <div key={item._id} className="card-premium overflow-hidden rounded-2xl group hover:shadow-card-hover hover:border-premium-accent/20 transition-all duration-300">
                <Link to={`/menu?highlight=${item._id}`} className="block aspect-square bg-white/5 relative overflow-hidden">
                  <img src={getItemImage(item)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                    {item.avgRating > 0 && (
                      <span className="bg-premium-card/90 text-premium-text text-xs font-bold px-2 py-1 rounded-lg">★ {item.avgRating}</span>
                    )}
                    <span className={item.veg ? 'text-green-400' : 'text-red-400'}>{item.veg ? '🟢' : '🔴'}</span>
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="font-semibold text-premium-text truncate">{item.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-premium-accent font-bold">₹{item.price}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); handleAddToCart(item); }}
                      className="bg-premium-accent hover:bg-premium-accentHover text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link to="/menu" className="text-premium-accent font-semibold hover:underline">See full menu →</Link>
          </div>
        </section>
      )}

      {/* Recommended (compact strip if we have both popular and recommended) */}
      {recommended.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-premium-text mb-6">Recommended for you</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 scrollbar-thin">
            {recommended.map((item) => (
              <Link key={item._id} to={`/menu?highlight=${item._id}`} className="flex-shrink-0 w-44 md:w-52 card-premium overflow-hidden rounded-2xl hover:shadow-card-hover hover:border-premium-accent/20 transition-all duration-300 group">
                <div className="aspect-square bg-white/5 relative">
                  <img src={getItemImage(item)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {item.avgRating > 0 && <span className="absolute bottom-2 left-2 bg-premium-card/90 text-premium-text text-xs font-bold px-2 py-0.5 rounded">★ {item.avgRating}</span>}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-premium-text truncate text-sm">{item.name}</p>
                  <p className="text-premium-accent font-bold">₹{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Offers */}
      {offers.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-premium-text mb-6">Offers & deals</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1">
            {offers.map((o) => (
              <div key={o.code} className="flex-shrink-0 w-72 rounded-2xl bg-gradient-to-br from-premium-accent/90 to-premium-accentHover text-white p-5 shadow-glow-sm hover:shadow-glow transition-shadow">
                <p className="font-bold text-lg">{o.description}</p>
                <p className="text-sm opacity-95 mt-1">Use code <strong>{o.code}</strong></p>
                {o.minOrder > 0 && <p className="text-xs mt-2 opacity-90">Min order ₹{o.minOrder}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-premium-text mb-6 text-center">What our customers say</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1">
            {testimonials.map((t) => (
              <div key={t._id} className="flex-shrink-0 w-80 card-premium p-5 hover:shadow-card-hover transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-amber-400">★</span>
                  <span className="font-semibold text-premium-text">{t.customerName}</span>
                </div>
                <p className="text-premium-muted text-sm leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section className="grid grid-cols-3 gap-4 mb-8">
        <Link to="/menu" className="card-premium p-5 text-center hover:shadow-card-hover hover:border-premium-accent/20 transition-all duration-300">
          <span className="text-3xl block mb-2">🍽️</span>
          <span className="font-medium text-premium-text text-sm">Menu</span>
        </Link>
        <Link to="/orders" className="card-premium p-5 text-center hover:shadow-card-hover hover:border-premium-accent/20 transition-all duration-300">
          <span className="text-3xl block mb-2">📋</span>
          <span className="font-medium text-premium-text text-sm">My Orders</span>
        </Link>
        <Link to="/cart" className="card-premium p-5 text-center hover:shadow-card-hover hover:border-premium-accent/20 transition-all duration-300">
          <span className="text-3xl block mb-2">🛒</span>
          <span className="font-medium text-premium-text text-sm">Cart</span>
        </Link>
      </section>

      {/* In-page footer CTA */}
      <section className="rounded-3xl bg-premium-card border border-white/10 p-8 md:p-10 text-center">
        <h2 className="text-2xl font-bold text-premium-text">Ready to order?</h2>
        <p className="text-premium-muted mt-2">Set your location and explore the menu.</p>
        <Link to="/menu" className="inline-block mt-5 btn-premium">Order Now</Link>
      </section>
    </>
  );
}
