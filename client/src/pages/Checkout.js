import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import * as api from '../services/api';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery (COD)' },
  { id: 'online', label: 'Pay Online' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { pincode: locationPincode } = useLocation();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [instructions, setInstructions] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: locationPincode || '',
    instructions: '',
  });

  useEffect(() => {
    if (user) {
      api.getMe().then(({ data }) => {
        const addrs = data.user?.addresses || [];
        setAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        if (def) {
          setSelectedAddressId(def._id);
          setDeliveryAddress({
            line1: def.line1,
            line2: def.line2 || '',
            city: def.city,
            state: def.state || '',
            pincode: def.pincode,
            instructions: '',
          });
        }
      }).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (locationPincode && !deliveryAddress.pincode) {
      setDeliveryAddress((a) => ({ ...a, pincode: locationPincode }));
    }
  }, [locationPincode]);

  const onSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setDeliveryAddress({
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state || '',
      pincode: addr.pincode,
      instructions: '',
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!items.length) {
      toast.error('Cart is empty');
      return;
    }
    const line1 = deliveryAddress.line1?.trim();
    const city = deliveryAddress.city?.trim();
    const pincode = deliveryAddress.pincode?.trim();
    if (!line1 || !city || !pincode) {
      toast.error('Please enter full address (line, city, pincode)');
      return;
    }
    if (!user && (!guestName.trim() || !guestPhone.trim())) {
      toast.error('Please enter your name and phone');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({ menuItem: i.menuItem, quantity: i.quantity, addons: i.addons })),
        deliveryAddress: {
          ...deliveryAddress,
          instructions: instructions || deliveryAddress.instructions,
        },
        paymentMethod,
      };
      if (user) {
        payload.guestName = user.name;
        payload.guestEmail = user.email;
        payload.guestPhone = user.phone;
      } else {
        payload.guestName = guestName.trim();
        payload.guestEmail = guestEmail.trim();
        payload.guestPhone = guestPhone.trim();
      }
      if (couponCode.trim()) payload.couponCode = couponCode.trim();
      const { data } = await api.createOrder(payload);
      clearCart();
      if (paymentMethod === 'online' && window.Razorpay) {
        try {
          const { data: pay } = await api.createRazorpayOrder(data.order.orderId);
          const options = {
            key: pay.key,
            amount: pay.amount * 100,
            currency: 'INR',
            name: 'TEATO',
            order_id: pay.razorpayOrderId,
            handler: async function (response) {
              await api.verifyRazorpayPayment({
                orderId: data.order.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
              });
              toast.success('Payment successful!');
              navigate(`/track/${data.order.orderId}`);
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', () => toast.error('Payment failed'));
          rzp.open();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Payment initiation failed');
          navigate(`/track/${data.order.orderId}`);
        }
      } else {
        toast.success('Order placed successfully!');
        navigate(`/track/${data.order.orderId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-premium-muted mb-4">Your cart is empty.</p>
        <Link to="/menu" className="btn-premium">Browse Menu</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Checkout - TEATO</title></Helmet>
      <h1 className="text-2xl font-bold text-premium-text mb-6">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="space-y-8">
        {/* Delivery address */}
        <section className="card-premium p-6">
          <h2 className="text-lg font-semibold text-premium-text mb-4">Delivery Address</h2>
          {user && addresses.length > 0 ? (
            <div className="space-y-2 mb-4">
              {addresses.map((addr) => (
                <label key={addr._id} className="flex items-start gap-3 p-3 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 text-premium-text">
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr._id}
                    onChange={() => onSelectAddress(addr)}
                    className="mt-1"
                  />
                  <span>{addr.line1}, {addr.city} - {addr.pincode}</span>
                </label>
              ))}
              <Link to="/addresses" className="text-premium-accent font-medium text-sm hover:underline">Add new address</Link>
            </div>
          ) : null}
          <div className="grid gap-4">
            {!user && (
              <>
                <input className="input-premium" placeholder="Your name *" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
                <input type="tel" className="input-premium" placeholder="Phone *" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} required />
                <input type="email" className="input-premium" placeholder="Email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
              </>
            )}
            <input className="input-premium" placeholder="Address line 1 *" value={deliveryAddress.line1} onChange={(e) => setDeliveryAddress((a) => ({ ...a, line1: e.target.value }))} required />
            <input className="input-premium" placeholder="Address line 2" value={deliveryAddress.line2} onChange={(e) => setDeliveryAddress((a) => ({ ...a, line2: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <input className="input-premium" placeholder="City *" value={deliveryAddress.city} onChange={(e) => setDeliveryAddress((a) => ({ ...a, city: e.target.value }))} required />
              <input className="input-premium" placeholder="Pincode *" value={deliveryAddress.pincode} onChange={(e) => setDeliveryAddress((a) => ({ ...a, pincode: e.target.value }))} required />
            </div>
            <input className="input-premium" placeholder="Delivery instructions (optional)" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          </div>
        </section>

        {/* Coupon */}
        <section className="card-premium p-6">
          <h2 className="text-lg font-semibold text-premium-text mb-2">Have a coupon?</h2>
          <input
            className="input-premium"
            placeholder="Enter code (e.g. TEATO20)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          />
        </section>

        {/* Payment */}
        <section className="card-premium p-6">
          <h2 className="text-lg font-semibold text-premium-text mb-4">Payment</h2>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((pm) => (
              <label key={pm.id} className="flex items-center gap-3 p-3 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 text-premium-text">
                <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} />
                <span>{pm.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Order summary */}
        <section className="card-premium p-6">
          <h2 className="text-lg font-semibold text-premium-text mb-4">Order Summary</h2>
          <ul className="space-y-2 mb-4 text-premium-text">
            {items.map((i) => (
              <li key={i.menuItem} className="flex justify-between">
                <span>{i.name} × {i.quantity}</span>
                <span>₹{(i.price * i.quantity).toFixed(0)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-white/10 pt-4 flex justify-between font-semibold text-lg text-premium-text">
            <span>Subtotal</span>
            <span>₹{cartTotal.toFixed(0)}</span>
          </div>
          <p className="text-premium-muted text-sm mt-2">Delivery fee calculated at server.</p>
        </section>

        <button type="submit" className="btn-premium w-full py-4 text-lg" disabled={loading}>
          {loading ? 'Placing order...' : 'Place Order'}
        </button>
      </form>
    </>
  );
}
