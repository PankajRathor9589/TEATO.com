/**
 * Admin: dashboard stats, orders list, update order status, menu CRUD, zones, customers, export
 */
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const User = require('../models/User');
const DeliveryZone = require('../models/DeliveryZone');
const Coupon = require('../models/Coupon');
const Testimonial = require('../models/Testimonial');
const HomeBanner = require('../models/HomeBanner');
const getIO = require('../utils/socket').getIO;

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

exports.dashboard = async (req, res, next) => {
  const todayStart = startOfToday();
  const [ordersToday, revenueToday, pendingOrders, totalOrders] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, paymentStatus: { $in: ['paid', 'pending'] }, status: { $ne: 'rejected' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.countDocuments({ status: { $in: ['pending', 'accepted', 'preparing', 'out_for_delivery'] } }),
    Order.countDocuments({}),
  ]);
  res.status(200).json({
    success: true,
    stats: {
      ordersToday: ordersToday || 0,
      revenueToday: (revenueToday[0]?.total) || 0,
      pendingOrders: pendingOrders || 0,
      totalOrders: totalOrders || 0,
    },
  });
};

exports.listOrders = async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(50, Math.max(1, parseInt(limit, 10)));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).populate('user', 'name email phone').lean(),
    Order.countDocuments(filter),
  ]);
  res.status(200).json({ success: true, orders, total, page: parseInt(page, 10), limit: limitNum });
};

exports.updateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, rejectedReason, deliveryPerson } = req.body;
  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  const allowed = ['accepted', 'rejected', 'preparing', 'out_for_delivery', 'delivered'];
  if (status && allowed.includes(status)) {
    order.status = status;
    if (status === 'rejected' && rejectedReason) order.rejectedReason = rejectedReason;
    if (status === 'delivered') order.deliveredAt = new Date();
  }
  if (deliveryPerson !== undefined) order.deliveryPerson = deliveryPerson || null;
  if (req.body.estimatedPrepMinutes !== undefined) order.estimatedPrepMinutes = req.body.estimatedPrepMinutes;
  await order.save();
  const io = getIO();
  if (io) {
    io.to(`order:${order.orderId}`).emit('order:updated', { orderId: order.orderId, order: order.toObject() });
    io.to('admin').emit('order:updated', { orderId: order.orderId, order: order.toObject() });
  }
  res.status(200).json({ success: true, order: order.toObject() });
};

exports.listCategories = async (req, res, next) => {
  const categories = await Category.find({}).sort('sortOrder').lean();
  res.status(200).json({ success: true, categories });
};

exports.createCategory = async (req, res, next) => {
  const { name, description, sortOrder } = req.body;
  const slug = (name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const category = await Category.create({ name, slug, description, sortOrder: sortOrder ?? 0 });
  res.status(201).json({ success: true, category });
};

exports.updateCategory = async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
  res.status(200).json({ success: true, category });
};

exports.deleteCategory = async (req, res, next) => {
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
  res.status(200).json({ success: true });
};

exports.listMenuItems = async (req, res, next) => {
  const items = await MenuItem.find({}).populate('category', 'name slug').sort('sortOrder').lean();
  res.status(200).json({ success: true, items });
};

function parseCustomizations(customizations) {
  if (!customizations) return [];
  if (Array.isArray(customizations)) return customizations;
  try {
    return typeof customizations === 'string' ? JSON.parse(customizations) : [];
  } catch {
    return [];
  }
}

exports.createMenuItem = async (req, res, next) => {
  const { name, description, category, price, veg, isAvailable, sortOrder, customizations, estimatedPrepMinutes } = req.body;
  const slug = (name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || Date.now();
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;
  const item = await MenuItem.create({
    name,
    slug,
    description,
    category,
    price: parseFloat(price) || 0,
    image,
    veg: veg !== false,
    isAvailable: isAvailable !== false,
    sortOrder: sortOrder ?? 0,
    customizations: parseCustomizations(customizations),
    estimatedPrepMinutes: estimatedPrepMinutes !== undefined && estimatedPrepMinutes !== '' ? Math.max(5, Math.min(60, parseInt(estimatedPrepMinutes, 10) || 10)) : undefined,
  });
  res.status(201).json({ success: true, item });
};

exports.updateMenuItem = async (req, res, next) => {
  const updates = { ...req.body };
  if (req.file) updates.image = `/uploads/${req.file.filename}`;
  delete updates.slug;
  if (updates.customizations !== undefined) updates.customizations = parseCustomizations(updates.customizations);
  if (updates.estimatedPrepMinutes !== undefined && updates.estimatedPrepMinutes !== '') {
    updates.estimatedPrepMinutes = Math.max(5, Math.min(60, parseInt(updates.estimatedPrepMinutes, 10) || 10));
  }
  const item = await MenuItem.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found.' });
  res.status(200).json({ success: true, item });
};

exports.deleteMenuItem = async (req, res, next) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found.' });
  res.status(200).json({ success: true });
};

exports.listDeliveryZones = async (req, res, next) => {
  const zones = await DeliveryZone.find({}).lean();
  res.status(200).json({ success: true, zones });
};

exports.createDeliveryZone = async (req, res, next) => {
  const zone = await DeliveryZone.create(req.body);
  res.status(201).json({ success: true, zone });
};

exports.updateDeliveryZone = async (req, res, next) => {
  const zone = await DeliveryZone.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!zone) return res.status(404).json({ success: false, message: 'Zone not found.' });
  res.status(200).json({ success: true, zone });
};

exports.deleteDeliveryZone = async (req, res, next) => {
  const z = await DeliveryZone.findByIdAndDelete(req.params.id);
  if (!z) return res.status(404).json({ success: false, message: 'Zone not found.' });
  res.status(200).json({ success: true });
};

exports.listCustomers = async (req, res, next) => {
  const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, customers: users });
};

exports.listDeliveryUsers = async (req, res, next) => {
  const users = await User.find({ role: 'delivery', isActive: true }).select('name email phone').sort({ name: 1 }).lean();
  res.status(200).json({ success: true, deliveryUsers: users });
};

exports.revenueAnalytics = async (req, res, next) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  const match = {
    createdAt: { $gte: start, $lte: end },
    status: { $ne: 'rejected' },
    paymentStatus: { $in: ['paid', 'pending'] },
  };
  const dateFormat = groupBy === 'month' ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } } : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
  const revenue = await Order.aggregate([
    { $match: match },
    { $group: { _id: dateFormat, totalRevenue: { $sum: '$total' }, orderCount: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const summary = await Order.aggregate([
    { $match: match },
    { $group: { _id: null, totalRevenue: { $sum: '$total' }, orderCount: { $sum: 1 } } },
  ]);
  res.status(200).json({
    success: true,
    revenue,
    summary: summary[0] || { totalRevenue: 0, orderCount: 0 },
  });
};

exports.listCoupons = async (req, res, next) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, coupons });
};

exports.createCoupon = async (req, res, next) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
};

exports.updateCoupon = async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
  res.status(200).json({ success: true, coupon });
};

exports.deleteCoupon = async (req, res, next) => {
  const c = await Coupon.findByIdAndDelete(req.params.id);
  if (!c) return res.status(404).json({ success: false, message: 'Coupon not found.' });
  res.status(200).json({ success: true });
};

exports.listTestimonials = async (req, res, next) => {
  const list = await Testimonial.find({}).sort('sortOrder').lean();
  res.status(200).json({ success: true, testimonials: list });
};
exports.createTestimonial = async (req, res, next) => {
  const t = await Testimonial.create(req.body);
  res.status(201).json({ success: true, testimonial: t });
};
exports.updateTestimonial = async (req, res, next) => {
  const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!t) return res.status(404).json({ success: false, message: 'Testimonial not found.' });
  res.status(200).json({ success: true, testimonial: t });
};
exports.deleteTestimonial = async (req, res, next) => {
  await Testimonial.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true });
};

exports.listBanners = async (req, res, next) => {
  const list = await HomeBanner.find({}).sort('sortOrder').lean();
  res.status(200).json({ success: true, banners: list });
};
exports.createBanner = async (req, res, next) => {
  const b = await HomeBanner.create(req.body);
  res.status(201).json({ success: true, banner: b });
};
exports.updateBanner = async (req, res, next) => {
  const b = await HomeBanner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!b) return res.status(404).json({ success: false, message: 'Banner not found.' });
  res.status(200).json({ success: true, banner: b });
};
exports.deleteBanner = async (req, res, next) => {
  await HomeBanner.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true });
};

exports.exportOrdersCsv = async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const filter = {};
  if (startDate) filter.createdAt = { ...filter.createdAt, $gte: new Date(startDate) };
  if (endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'Address', 'Items', 'Subtotal', 'Delivery', 'Discount', 'Total', 'Status', 'Payment'];
  const rows = orders.map((o) => [
    o.orderId,
    new Date(o.createdAt).toISOString(),
    o.guestName || (o.user && o.user.name) || '',
    o.guestPhone || (o.user && o.user.phone) || '',
    [o.deliveryAddress?.line1, o.deliveryAddress?.city, o.deliveryAddress?.pincode].filter(Boolean).join(', '),
    (o.items || []).map((i) => `${i.name} x${i.quantity}`).join('; '),
    o.subtotal,
    o.deliveryFee,
    o.discount,
    o.total,
    o.status,
    o.paymentStatus,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=teato-orders-${Date.now()}.csv`);
  res.send(csv);
};

// ---------- Owner-only: User management ----------
const STAFF_ROLES = ['admin', 'kitchen', 'delivery'];

exports.listUsers = async (req, res, next) => {
  const { role, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(100, Math.max(1, parseInt(limit, 10)));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    User.countDocuments(filter),
  ]);
  res.status(200).json({ success: true, users, total, page: parseInt(page, 10), limit: limitNum });
};

exports.createUser = async (req, res, next) => {
  const { name, email, password, phone, role: newRole } = req.body;
  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Name, email and password (min 6 chars) required.' });
  }
  if (!STAFF_ROLES.includes(newRole)) {
    return res.status(400).json({ success: false, message: 'Role must be admin, kitchen, or delivery.' });
  }
  const existing = await User.findOne({ email: email.trim().toLowerCase() });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });
  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    phone: (phone || '').trim() || undefined,
    role: newRole,
  });
  res.status(201).json({ success: true, user: user.toObject({ transform: (_, o) => { delete o.password; return o; } }) });
};

exports.updateUser = async (req, res, next) => {
  const { id } = req.params;
  const { name, phone, role: newRole, isActive } = req.body;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.role === 'owner') {
    return res.status(403).json({ success: false, message: 'Cannot modify owner account.' });
  }
  if (name !== undefined) user.name = String(name).trim();
  if (phone !== undefined) user.phone = (phone || '').trim() || undefined;
  if (isActive !== undefined) user.isActive = Boolean(isActive);
  if (newRole !== undefined) {
    if (!STAFF_ROLES.includes(newRole)) {
      return res.status(400).json({ success: false, message: 'Role must be admin, kitchen, or delivery.' });
    }
    user.role = newRole;
  }
  await user.save();
  const out = user.toObject();
  delete out.password;
  res.status(200).json({ success: true, user: out });
};
