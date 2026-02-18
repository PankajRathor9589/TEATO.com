const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

router.get('/testimonials', contentController.getTestimonials);
router.get('/banners', contentController.getBanners);

module.exports = router;
