/**
 * Customer testimonials for homepage - high-trust social proof
 */
const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    text: { type: String, required: true, maxlength: 500 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    image: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

testimonialSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
