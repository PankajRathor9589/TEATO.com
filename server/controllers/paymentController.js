/**
 * Razorpay: create order, verify payment, capture
 */
const Order = require('../models/Order');
const razorpay = require('../config/razorpay');
const getIO = require('../utils/socket').getIO;

exports.createRazorpayOrder = async (req, res, next) => {
  if (!razorpay) {
    return res.status(503).json({ success: false, message: 'Online payment not configured.' });
  }
  const { orderId } = req.body;
  const order = await Order.findOne({ orderId });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  if (order.paymentMethod !== 'online') {
    return res.status(400).json({ success: false, message: 'Order is not for online payment.' });
  }
  if (order.paymentStatus === 'paid') {
    return res.status(400).json({ success: false, message: 'Order already paid.' });
  }
  const amount = Math.round(order.total * 100); // paise
  if (amount < 100) {
    return res.status(400).json({ success: false, message: 'Minimum amount is ₹1.' });
  }
  try {
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: order.orderId,
    });
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: order.total,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Payment initiation failed.' });
  }
};

exports.verifyRazorpayPayment = async (req, res, next) => {
  const { orderId, razorpayPaymentId, razorpayOrderId } = req.body;
  const order = await Order.findOne({ orderId });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  if (order.paymentStatus === 'paid') {
    return res.status(200).json({ success: true, message: 'Already paid.', order: order.toObject() });
  }
  // In production, verify signature and capture via Razorpay API
  order.razorpayPaymentId = razorpayPaymentId || order.razorpayOrderId;
  order.paymentStatus = 'paid';
  await order.save();
  const io = getIO();
  if (io) io.emit('order:updated', { orderId: order.orderId, order: order.toObject() });
  res.status(200).json({ success: true, order: order.toObject() });
};
