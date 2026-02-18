/**
 * Order: create (guest or user), get my orders, get single order, cancel (if pending)
 */
const Order = require('../models/Order');
const DeliveryZone = require('../models/DeliveryZone');
const Coupon = require('../models/Coupon');
const MenuItem = require('../models/MenuItem');
const getIO = require('../utils/socket').getIO;

const getDeliveryFee = async (pincode, subtotal) => {
  const zone = await DeliveryZone.findOne({ pincodes: pincode?.trim(), isActive: true });
  if (!zone) return { fee: 0, minOrder: 0 };
  const minOrder = zone.minOrderAmount || 0;
  if (subtotal < minOrder) return { fee: null, minOrder }; // Cannot deliver
  return { fee: zone.deliveryFee || 0, minOrder };
};

const applyCoupon = async (code, subtotal) => {
  if (!code?.trim()) return { discount: 0, coupon: null };
  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    isActive: true,
    $and: [
      { $or: [{ validFrom: { $lte: new Date() } }, { validFrom: null }] },
      { $or: [{ validUntil: { $gte: new Date() } }, { validUntil: null }] },
    ],
  });
  if (!coupon) return { discount: 0, coupon: null, error: 'Invalid or expired coupon.' };
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { discount: 0, coupon: null, error: 'Coupon usage limit reached.' };
  }
  if (subtotal < (coupon.minOrderAmount || 0)) {
    return { discount: 0, coupon: null, error: `Minimum order amount is ₹${coupon.minOrderAmount}.` };
  }
  let discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
  if (coupon.type === 'percent' && coupon.maxDiscount && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount;
  }
  return { discount, coupon };
};

exports.createOrder = async (req, res, next) => {
  const {
    items,
    deliveryAddress,
    paymentMethod,
    couponCode,
    guestEmail,
    guestPhone,
    guestName,
  } = req.body;

  if (!items?.length || !deliveryAddress?.line1 || !deliveryAddress?.city || !deliveryAddress?.pincode) {
    return res.status(400).json({
      success: false,
      message: 'Items and full delivery address (line1, city, pincode) are required.',
    });
  }

  const pincode = deliveryAddress.pincode?.toString().trim();
  const { fee: deliveryFee, minOrder } = await getDeliveryFee(pincode, 0);
  if (minOrder !== undefined && minOrder > 0) {
    // We'll check again after subtotal
  }

  let subtotal = 0;
  let totalPrepMinutes = 0;
  const orderItems = [];
  for (const row of items) {
    const item = await MenuItem.findById(row.menuItem).lean();
    if (!item || !item.isAvailable) {
      return res.status(400).json({ success: false, message: `Item not available: ${row.menuItem}` });
    }
    const qty = Math.max(1, parseInt(row.quantity, 10) || 1);
    let linePrice = item.price;
    const selectedAddons = [];
    const customizations = item.customizations || [];
    for (const add of row.addons || []) {
      const cust = customizations.find((c) => c.name === add.name);
      const opt = cust?.options?.find((o) => o.name === add.optionName);
      if (opt) {
        const addonPrice = (opt.price || 0) * qty;
        linePrice += addonPrice / qty;
        selectedAddons.push({ name: add.name, optionName: add.optionName, price: opt.price || 0 });
      }
    }
    const lineTotal = linePrice * qty;
    subtotal += lineTotal;
    totalPrepMinutes += (item.estimatedPrepMinutes || 10) * qty;
    orderItems.push({
      menuItem: item._id,
      name: item.name,
      price: linePrice,
      quantity: qty,
      image: item.image,
      selectedAddons: selectedAddons.length ? selectedAddons : undefined,
    });
  }

  const { discount, error: couponError } = await applyCoupon(couponCode, subtotal);
  if (couponError) {
    return res.status(400).json({ success: false, message: couponError });
  }

  const { fee: df, minOrder: minOrd } = await getDeliveryFee(pincode, subtotal);
  if (minOrd !== undefined && minOrd > 0 && subtotal < minOrd) {
    return res.status(400).json({
      success: false,
      message: `Minimum order for your area is ₹${minOrd}.`,
    });
  }
const finalDeliveryFee = df ?? 0;


  const total = Math.max(0, subtotal + finalDeliveryFee - discount);

  const orderData = {
    user: req.user?.id,
    guestEmail: guestEmail || req.body.email,
    guestPhone: guestPhone || req.body.phone,
    guestName: guestName || req.body.guestName,
    items: orderItems,
    subtotal,
    deliveryFee: finalDeliveryFee,
    discount,
    couponCode: couponCode || undefined,
    total,
    estimatedPrepMinutes: Math.min(60, Math.max(10, Math.ceil(totalPrepMinutes / 2))),
    deliveryAddress: {
      line1: deliveryAddress.line1,
      line2: deliveryAddress.line2,
      city: deliveryAddress.city,
      state: deliveryAddress.state,
      pincode,
      lat: deliveryAddress.lat,
      lng: deliveryAddress.lng,
      instructions: deliveryAddress.instructions,
    },
    paymentMethod: paymentMethod === 'online' ? 'online' : 'cod',
    paymentStatus: paymentMethod === 'online' ? 'pending' : 'pending',
  };

  const order = await Order.create(orderData);

  // Update popular-item counts (orderCount) for each menu item
  for (const row of orderItems) {
    await MenuItem.findByIdAndUpdate(row.menuItem, { $inc: { orderCount: row.quantity } });
  }

  const io = getIO();
  if (io) {
    const payload = { orderId: order.orderId, order: order.toObject(), playSound: true, estimatedPrepMinutes: order.estimatedPrepMinutes };
    io.emit('order:new', payload);
    io.to('admin').emit('order:new', payload);
    io.to('kitchen').emit('order:new', payload);
  }

  res.status(201).json({ success: true, order: order.toObject() });
};

exports.getMyOrders = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Login required to view orders.' });
  }
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, orders });
};

exports.getLastOrder = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Login required.' });
  }
  const order = await Order.findOne({ user: req.user.id, status: { $nin: ['rejected'] } })
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json({ success: true, order: order || null });
};

exports.getOrderById = async (req, res, next) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  const isOwner = req.user && (req.user.id === order.user?.toString() || req.user.role === 'admin' || req.user.role === 'delivery');
  if (!isOwner) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  res.status(200).json({ success: true, order });
};

exports.getOrderByOrderId = async (req, res, next) => {
  const order = await Order.findOne({ orderId: req.params.orderId }).lean();
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  const isOwner = req.user && (req.user.id === order.user?.toString() || req.user.role === 'admin' || req.user.role === 'delivery');
  const isGuestOrder = !order.user;
  if (!isOwner && !isGuestOrder) return res.status(403).json({ success: false, message: 'Access denied.' });
  res.status(200).json({ success: true, order });
};

exports.cancelOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  if (order.user?.toString() !== req.user?.id) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  if (order.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled.' });
  }
  order.status = 'rejected';
  order.rejectedReason = 'Cancelled by customer';
  await order.save();
  const io = getIO();
  if (io) io.emit('order:updated', { orderId: order.orderId, order: order.toObject() });
  res.status(200).json({ success: true, order: order.toObject() });
};
