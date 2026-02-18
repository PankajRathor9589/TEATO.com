const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload').single('image');

router.use(protect, authorize('admin', 'owner'));

router.get('/dashboard', adminController.dashboard);
router.get('/orders', adminController.listOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

router.get('/categories', adminController.listCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

router.get('/menu', adminController.listMenuItems);
router.post('/menu', upload, adminController.createMenuItem);
router.put('/menu/:id', upload, adminController.updateMenuItem);
router.delete('/menu/:id', adminController.deleteMenuItem);

router.get('/zones', adminController.listDeliveryZones);
router.post('/zones', adminController.createDeliveryZone);
router.put('/zones/:id', adminController.updateDeliveryZone);
router.delete('/zones/:id', adminController.deleteDeliveryZone);

router.get('/customers', adminController.listCustomers);
router.get('/delivery-users', adminController.listDeliveryUsers);
router.get('/revenue', adminController.revenueAnalytics);
router.get('/coupons', adminController.listCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

router.get('/analytics/advanced', analyticsController.advancedDashboard);
router.get('/analytics/best-selling', analyticsController.bestSellingReport);

router.get('/testimonials', adminController.listTestimonials);
router.post('/testimonials', adminController.createTestimonial);
router.put('/testimonials/:id', adminController.updateTestimonial);
router.delete('/testimonials/:id', adminController.deleteTestimonial);

router.get('/banners', adminController.listBanners);
router.post('/banners', adminController.createBanner);
router.put('/banners/:id', adminController.updateBanner);
router.delete('/banners/:id', adminController.deleteBanner);

router.get('/export/orders', adminController.exportOrdersCsv);

// Owner-only: user management (admins, kitchen, delivery)
router.get('/users', authorize('owner'), adminController.listUsers);
router.post('/users', authorize('owner'), adminController.createUser);
router.put('/users/:id', authorize('owner'), adminController.updateUser);

module.exports = router;
