const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/categories', menuController.getCategories);
router.get('/items', menuController.getMenuItems);
router.get('/popular', menuController.getPopularItems);
router.get('/recommended', menuController.getRecommendedItems);
router.get('/offers', menuController.getOffers);
router.get('/items/:slug', menuController.getMenuItemBySlug);

module.exports = router;
