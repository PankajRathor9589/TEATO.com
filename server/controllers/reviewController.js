/**
 * Reviews: add review (after order), list by menu item
 */
const Review = require('../models/Review');
const MenuItem = require('../models/MenuItem');

const updateMenuItemRating = async (menuItemId) => {
  const agg = await Review.aggregate([
    { $match: { menuItem: menuItemId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avgRating = agg[0]?.avg ?? 0;
  const reviewCount = agg[0]?.count ?? 0;
  await MenuItem.findByIdAndUpdate(menuItemId, { avgRating: Math.round(avgRating * 10) / 10, reviewCount });
};

exports.addReview = async (req, res, next) => {
  const { menuItemId, orderId, rating, comment } = req.body;
  if (!menuItemId || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'menuItemId and rating (1-5) required.' });
  }
  const existing = await Review.findOne({ user: req.user.id, menuItem: menuItemId });
  if (existing) {
    existing.rating = rating;
    existing.comment = comment || existing.comment;
    existing.order = orderId || existing.order;
    await existing.save();
    await updateMenuItemRating(menuItemId);
    return res.status(200).json({ success: true, review: existing });
  }
  const review = await Review.create({
    user: req.user.id,
    menuItem: menuItemId,
    order: orderId,
    rating,
    comment: comment || '',
  });
  await updateMenuItemRating(menuItemId);
  res.status(201).json({ success: true, review });
};

exports.getReviewsByMenuItem = async (req, res, next) => {
  const reviews = await Review.find({ menuItem: req.params.menuItemId })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.status(200).json({ success: true, reviews });
};
