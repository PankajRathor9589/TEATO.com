/**
 * Menu category model - e.g. Starters, Main Course, Beverages
 */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ sortOrder: 1, isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);
