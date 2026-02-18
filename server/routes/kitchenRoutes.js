const express = require('express');
const router = express.Router();
const kitchenController = require('../controllers/kitchenController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('kitchen', 'admin'));
router.get('/orders', kitchenController.getIncomingOrders);
router.put('/orders/:id/status', kitchenController.updateOrderStatus);

module.exports = router;
