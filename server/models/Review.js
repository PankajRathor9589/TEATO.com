/**
 * Review model - ratings and reviews for menu items (Zomato-style)
 */
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

reviewSchema.index({ menuItem: 1, createdAt: -1 });
reviewSchema.index({ user: 1, menuItem: 1 }, { unique: true }); // One review per user per item

module.exports = mongoose.model('Review', reviewSchema);
