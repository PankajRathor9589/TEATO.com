/**
 * Kitchen panel: incoming orders, status updates (accepted → preparing)
 */
const Order = require('../models/Order');
const getIO = require('../utils/socket').getIO;

exports.getIncomingOrders = async (req, res, next) => {
  const orders = await Order.find({
    status: { $in: ['pending', 'accepted', 'preparing'] },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.status(200).json({ success: true, orders });
};

exports.updateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, estimatedPrepMinutes } = req.body;
  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  const allowed = ['accepted', 'preparing'];
  if (status && allowed.includes(status)) {
    order.status = status;
  }
  if (estimatedPrepMinutes !== undefined) order.estimatedPrepMinutes = Math.max(5, Math.min(60, parseInt(estimatedPrepMinutes, 10) || 15));
  await order.save();
  const io = getIO();
  if (io) {
    io.to(`order:${order.orderId}`).emit('order:updated', { orderId: order.orderId, order: order.toObject() });
    io.to('admin').emit('order:updated', { orderId: order.orderId, order: order.toObject() });
    io.to('kitchen').emit('order:updated', { orderId: order.orderId, order: order.toObject() });
  }
  res.status(200).json({ success: true, order: order.toObject() });
};
