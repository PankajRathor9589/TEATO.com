const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('delivery', 'admin'));
router.get('/my-deliveries', deliveryController.getMyDeliveries);
router.get('/pending', deliveryController.getAssignedPending);
router.get('/completed', deliveryController.getCompletedHistory);
router.get('/performance', deliveryController.getPerformance);
router.put('/orders/:id/confirm', deliveryController.confirmDelivery);

module.exports = router;
