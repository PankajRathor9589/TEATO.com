/**
 * Delivery zone model - areas where TEATO delivers (with optional delivery fee)
 */
const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pincodes: [{ type: String, trim: true }],
    deliveryFee: { type: Number, default: 0 },
    minOrderAmount: { type: Number, default: 0 },
    estimatedMinutes: { type: Number, default: 45 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

deliveryZoneSchema.index({ pincodes: 1 });

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema);
