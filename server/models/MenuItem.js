/**
 * Menu item model - individual food items with price and availability
 */
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    description: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    veg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 }, // For "popular" ranking
    // Add-ons and variants (e.g. Size: Regular +0, Large +50)
    customizations: [
      {
        name: String,
        required: { type: Boolean, default: false },
        options: [{ name: String, price: Number }],
      },
    ],
    estimatedPrepMinutes: { type: Number, default: 10 },
  },
  { timestamps: true }
);

menuItemSchema.index({ category: 1, isAvailable: 1, sortOrder: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
