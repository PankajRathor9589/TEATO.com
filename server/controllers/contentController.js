/**
 * Public content: testimonials, homepage banners (for customer-facing UI)
 */
const Testimonial = require('../models/Testimonial');
const HomeBanner = require('../models/HomeBanner');

exports.getTestimonials = async (req, res, next) => {
  const list = await Testimonial.find({ isActive: true }).sort('sortOrder').limit(20).lean();
  res.status(200).json({ success: true, testimonials: list });
};

exports.getBanners = async (req, res, next) => {
  const type = req.query.type;
  const filter = { isActive: true };
  if (type) filter.type = type;
  const list = await HomeBanner.find(filter).sort('sortOrder').limit(10).lean();
  res.status(200).json({ success: true, banners: list });
};
