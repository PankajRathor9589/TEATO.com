/**
 * Menu: list categories, list items, popular items, offers (Zomato-style)
 */
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Coupon = require('../models/Coupon');
const { applyDefaultImages, applyDefaultImage } = require('../utils/defaultImages');

exports.getCategories = async (req, res, next) => {
  const categories = await Category.find({ isActive: true }).sort('sortOrder').lean();
  res.status(200).json({ success: true, categories });
};

exports.getMenuItems = async (req, res, next) => {
  const { category, search, available } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (available !== 'false') filter.isAvailable = true;
  if (search?.trim()) {
    const s = search.trim();
    filter.$or = [
      { name: new RegExp(s, 'i') },
      { description: new RegExp(s, 'i') },
    ];
  }
  const query = MenuItem.find(filter).populate('category', 'name slug').sort('sortOrder');
  const items = await query.lean();
  res.status(200).json({ success: true, items: applyDefaultImages(items) });
};

exports.getPopularItems = async (req, res, next) => {
  const limit = Math.min(20, parseInt(req.query.limit, 10) || 10);
  const items = await MenuItem.find({ isAvailable: true })
    .sort({ orderCount: -1, avgRating: -1 })
    .limit(limit)
    .populate('category', 'name slug')
    .lean();
  res.status(200).json({ success: true, items: applyDefaultImages(items) });
};

exports.getRecommendedItems = async (req, res, next) => {
  const limit = Math.min(12, parseInt(req.query.limit, 10) || 8);
  const items = await MenuItem.find({ isAvailable: true, avgRating: { $gte: 4 } })
    .sort({ avgRating: -1, orderCount: -1 })
    .limit(limit)
    .populate('category', 'name slug')
    .lean();
  res.status(200).json({ success: true, items: applyDefaultImages(items) });
};

exports.getOffers = async (req, res, next) => {
  const now = new Date();
  const coupons = await Coupon.find({
    isActive: true,
    $and: [
      { $or: [{ validFrom: { $lte: now } }, { validFrom: null }] },
      { $or: [{ validUntil: { $gte: now } }, { validUntil: null }] },
    ],
  })
    .select('code type value minOrderAmount maxDiscount')
    .limit(10)
    .lean();
  const offers = coupons.map((c) => ({
    code: c.code,
    description: c.type === 'percent' ? `${c.value}% off` : `₹${c.value} off`,
    minOrder: c.minOrderAmount,
  }));
  res.status(200).json({ success: true, offers });
};

exports.getMenuItemBySlug = async (req, res, next) => {
  const item = await MenuItem.findOne({ slug: req.params.slug, isAvailable: true })
    .populate('category', 'name slug')
    .lean();
  if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
  res.status(200).json({ success: true, item: applyDefaultImage(item) });
};
