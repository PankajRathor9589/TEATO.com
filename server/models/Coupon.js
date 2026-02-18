/**
 * Coupon model - discount codes (future-ready)
 */
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, unique: true },
    type: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number }, // For percent type
    validFrom: { type: Date },
    validUntil: { type: Date },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1, isActive: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
