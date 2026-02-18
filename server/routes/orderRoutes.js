const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, orderController.createOrder);
router.get('/my', protect, orderController.getMyOrders);
router.get('/last', protect, orderController.getLastOrder);
router.get('/id/:id', protect, orderController.getOrderById);
router.get('/:orderId', orderController.getOrderByOrderId); // guest can track with orderId
router.put('/:id/cancel', protect, orderController.cancelOrder);

module.exports = router;
