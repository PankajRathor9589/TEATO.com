const express = require('express');
const router = express.Router();
const pushController = require('../controllers/pushController');
const { protect } = require('../middleware/auth');

router.post('/subscribe', protect, pushController.subscribe);
router.delete('/unsubscribe', protect, pushController.unsubscribe);

module.exports = router;
