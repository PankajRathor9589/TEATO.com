/**
 * Central API client - all backend requests go through this
 */
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: baseURL ? baseURL + '/api' : '/api',
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teato_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: on 401 clear token and optionally redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('teato_token');
      // Don't redirect here; let the component handle (e.g. redirect to login for protected routes)
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const addAddress = (data) => api.post('/auth/addresses', data);
export const updateAddress = (id, data) => api.put(`/auth/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/auth/addresses/${id}`);
export const logout = () => api.get('/auth/logout');

// Menu (public)
export const getCategories = () => api.get('/menu/categories');
export const getMenuItems = (params) => api.get('/menu/items', { params });
export const getPopularItems = (params) => api.get('/menu/popular', { params });
export const getOffers = () => api.get('/menu/offers');
export const getMenuItemBySlug = (slug) => api.get(`/menu/items/${slug}`);
export const getRecommendedItems = (params) => api.get('/menu/recommended', { params });

// Content (public)
export const getTestimonials = () => api.get('/content/testimonials');
export const getBanners = () => api.get('/content/banners');

// Reviews
export const getReviewsByMenuItem = (menuItemId) => api.get(`/reviews/menu/${menuItemId}`);
export const addReview = (data) => api.post('/reviews', data);

// Orders
export const createOrder = (data) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders/my');
export const getLastOrder = () => api.get('/orders/last');
export const getOrderById = (id) => api.get(`/orders/id/${id}`);
export const getOrderByOrderId = (orderId) => api.get(`/orders/${orderId}`);
export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`);

// Payments
export const createRazorpayOrder = (orderId) => api.post('/payments/razorpay/create', { orderId });
export const verifyRazorpayPayment = (data) => api.post('/payments/razorpay/verify', data);

// Admin
export const adminDashboard = () => api.get('/admin/dashboard');
export const adminOrders = (params) => api.get('/admin/orders', { params });
export const adminUpdateOrderStatus = (id, data) => api.put(`/admin/orders/${id}/status`, data);
export const adminCategories = () => api.get('/admin/categories');
export const adminCreateCategory = (data) => api.post('/admin/categories', data);
export const adminUpdateCategory = (id, data) => api.put(`/admin/categories/${id}`, data);
export const adminDeleteCategory = (id) => api.delete(`/admin/categories/${id}`);
export const adminMenu = () => api.get('/admin/menu');
export const adminCreateMenuItem = (formData) => api.post('/admin/menu', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdateMenuItem = (id, formData) => api.put(`/admin/menu/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeleteMenuItem = (id) => api.delete(`/admin/menu/${id}`);
export const adminZones = () => api.get('/admin/zones');
export const adminCreateZone = (data) => api.post('/admin/zones', data);
export const adminUpdateZone = (id, data) => api.put(`/admin/zones/${id}`, data);
export const adminDeleteZone = (id) => api.delete(`/admin/zones/${id}`);
export const adminCustomers = () => api.get('/admin/customers');
export const adminDeliveryUsers = () => api.get('/admin/delivery-users');
export const adminRevenueAnalytics = (params) => api.get('/admin/revenue', { params });
export const adminCoupons = () => api.get('/admin/coupons');
export const adminCreateCoupon = (data) => api.post('/admin/coupons', data);
export const adminUpdateCoupon = (id, data) => api.put(`/admin/coupons/${id}`, data);
export const adminDeleteCoupon = (id) => api.delete(`/admin/coupons/${id}`);
export const adminExportOrders = (params) => api.get('/admin/export/orders', { params, responseType: 'blob' });
export const adminAdvancedAnalytics = (params) => api.get('/admin/analytics/advanced', { params });
export const adminBestSelling = (params) => api.get('/admin/analytics/best-selling', { params });
export const adminTestimonials = () => api.get('/admin/testimonials');
export const adminCreateTestimonial = (data) => api.post('/admin/testimonials', data);
export const adminUpdateTestimonial = (id, data) => api.put(`/admin/testimonials/${id}`, data);
export const adminDeleteTestimonial = (id) => api.delete(`/admin/testimonials/${id}`);
export const adminBanners = () => api.get('/admin/banners');
export const adminCreateBanner = (data) => api.post('/admin/banners', data);
export const adminUpdateBanner = (id, data) => api.put(`/admin/banners/${id}`, data);
export const adminDeleteBanner = (id) => api.delete(`/admin/banners/${id}`);

// Owner-only: user management
export const adminListUsers = (params) => api.get('/admin/users', { params });
export const adminCreateUser = (data) => api.post('/admin/users', data);
export const adminUpdateUser = (id, data) => api.put(`/admin/users/${id}`, data);

// Push
export const pushSubscribe = (data) => api.post('/push/subscribe', data);
export const pushUnsubscribe = () => api.delete('/push/unsubscribe');

// Kitchen
export const kitchenGetOrders = () => api.get('/kitchen/orders');
export const kitchenUpdateOrderStatus = (id, data) => api.put(`/kitchen/orders/${id}/status`, data);

// Delivery
export const deliveryGetMyDeliveries = () => api.get('/delivery/my-deliveries');
export const deliveryGetPending = () => api.get('/delivery/pending');
export const deliveryGetCompleted = (params) => api.get('/delivery/completed', { params });
export const deliveryGetPerformance = (params) => api.get('/delivery/performance', { params });
export const deliveryConfirm = (id) => api.put(`/delivery/orders/${id}/confirm`);

export default api;
