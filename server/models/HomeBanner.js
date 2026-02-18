/**
 * Homepage banner / content management for hero and promos
 */
const mongoose = require('mongoose');

const homeBannerSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    image: { type: String },
    link: { type: String, trim: true },
    linkText: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    type: { type: String, enum: ['hero', 'promo', 'banner'], default: 'banner' },
  },
  { timestamps: true }
);

homeBannerSchema.index({ isActive: 1, type: 1, sortOrder: 1 });

module.exports = mongoose.model('HomeBanner', homeBannerSchema);
