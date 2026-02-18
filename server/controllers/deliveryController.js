/**
 * Delivery panel: assigned deliveries, status updates, delivery confirmation
 */
const Order = require('../models/Order');
const getIO = require('../utils/socket').getIO;

exports.getMyDeliveries = async (req, res, next) => {
  const orders = await Order.find({
    deliveryPerson: req.user.id,
    status: { $in: ['out_for_delivery', 'delivered'] },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.status(200).json({ success: true, orders });
};

exports.getAssignedPending = async (req, res, next) => {
  const orders = await Order.find({
    deliveryPerson: req.user.id,
    status: 'out_for_delivery',
  })
    .sort({ createdAt: 1 })
    .lean();
  res.status(200).json({ success: true, orders });
};

exports.getCompletedHistory = async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ deliveryPerson: req.user.id, status: 'delivered' })
      .sort({ deliveredAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ deliveryPerson: req.user.id, status: 'delivered' }),
  ]);
  res.status(200).json({ success: true, orders, total, page, limit });
};

exports.getPerformance = async (req, res, next) => {
  const days = Math.min(90, parseInt(req.query.days, 10) || 30);
  const start = new Date();
  start.setDate(start.getDate() - days);
  const delivered = await Order.find({
    deliveryPerson: req.user.id,
    status: 'delivered',
    deliveredAt: { $gte: start },
  }).lean();
  const count = delivered.length;
  let totalMinutes = 0;
  for (const o of delivered) {
    if (o.deliveredAt && o.createdAt) {
      totalMinutes += (new Date(o.deliveredAt) - new Date(o.createdAt)) / (60 * 1000);
    }
  }
  res.status(200).json({
    success: true,
    deliveredCount: count,
    avgDeliveryMinutes: count ? Math.round(totalMinutes / count) : 0,
  });
};

exports.confirmDelivery = async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  if (order.deliveryPerson?.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not assigned to you.' });
  }
  if (order.status !== 'out_for_delivery') {
    return res.status(400).json({ success: false, message: 'Order is not out for delivery.' });
  }
  order.status = 'delivered';
  order.deliveredAt = new Date();
  await order.save();
  const io = getIO();
  if (io) {
    io.to(`order:${order.orderId}`).emit('order:updated', { orderId: order.orderId, order: order.toObject() });
    io.to('admin').emit('order:updated', { orderId: order.orderId, order: order.toObject() });
  }
  res.status(200).json({ success: true, order: order.toObject() });
};
