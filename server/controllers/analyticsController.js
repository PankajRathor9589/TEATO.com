/**
 * Advanced analytics: revenue trends, peak hours, best-selling items, customer retention
 */
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

exports.advancedDashboard = async (req, res, next) => {
  const days = Math.min(90, parseInt(req.query.days, 10) || 30);
  const start = startOfDay(Date.now() - days * 24 * 60 * 60 * 1000);
  const end = new Date();

  const [revenueByDay, peakHours, bestSelling, retention] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'rejected' }, paymentStatus: { $in: ['paid', 'pending'] } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'rejected' } } },
      { $project: { hour: { $hour: '$createdAt' } } },
      { $group: { _id: '$hour', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'rejected' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.menuItem', name: { $first: '$items.name' }, qty: { $sum: '$items.quantity' } } },
      { $sort: { qty: -1 } },
      { $limit: 15 },
    ]),
    getRetentionMetrics(start, end),
  ]);

  res.status(200).json({
    success: true,
    revenueTrend: revenueByDay,
    peakHours: peakHours.map((h) => ({ hour: h._id, count: h.count })),
    bestSellingItems: bestSelling,
    retention: retention,
  });
};

async function getRetentionMetrics(start, end) {
  const returning = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, user: { $ne: null }, status: { $ne: 'rejected' } } },
    { $group: { _id: '$user', orders: { $sum: 1 } } },
    { $match: { orders: { $gte: 2 } } },
    { $count: 'count' },
  ]);
  const totalWithOrders = await Order.distinct('user', { createdAt: { $gte: start, $lte: end }, user: { $ne: null }, status: { $ne: 'rejected' } });
  const totalCustomers = totalWithOrders.length;
  const returningCount = returning[0]?.count || 0;
  return {
    totalCustomersWithOrders: totalCustomers,
    returningCustomers: returningCount,
    retentionRate: totalCustomers ? ((returningCount / totalCustomers) * 100).toFixed(1) : 0,
  };
}

exports.bestSellingReport = async (req, res, next) => {
  const days = Math.min(365, parseInt(req.query.days, 10) || 30);
  const start = startOfDay(Date.now() - days * 24 * 60 * 60 * 1000);
  const items = await Order.aggregate([
    { $match: { createdAt: { $gte: start }, status: { $ne: 'rejected' } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.menuItem', name: { $first: '$items.name' }, quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    { $sort: { quantity: -1 } },
    { $limit: 50 },
  ]);
  res.status(200).json({ success: true, items });
};
