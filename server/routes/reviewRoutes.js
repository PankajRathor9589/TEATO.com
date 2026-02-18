const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/menu/:menuItemId', reviewController.getReviewsByMenuItem);
router.post('/', protect, reviewController.addReview);

module.exports = router;
