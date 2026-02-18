# TEATO API Reference

Base URL: `http://localhost:5000/api` (or your deployed server).

All authenticated requests must include:
- **Header:** `Authorization: Bearer <JWT_TOKEN>`
- Or **Cookie:** `token=<JWT_TOKEN>`

---

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register (name, email, password, phone?) | No |
| POST | `/auth/login` | Login (email, password) | No |
| POST | `/auth/logout` | Logout | Yes |
| GET | `/auth/me` | Current user | Yes |

---

## Public (Menu & Content)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/menu/categories` | List categories |
| GET | `/menu/items` | List items (?category=, ?search=, ?available=) |
| GET | `/menu/popular` | Popular items (?limit=) |
| GET | `/menu/recommended` | Recommended items (?limit=) |
| GET | `/menu/offers` | Active coupons/offers |
| GET | `/content/testimonials` | Testimonials |
| GET | `/content/banners` | Homepage banners |

Menu item responses include a default image URL when no custom image is set (category-based fallback).

---

## Orders (Customer)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/orders` | Create order (items, deliveryAddress, paymentMethod, guestName?, couponCode?) | Optional |
| GET | `/orders/last` | Last order (one-click reorder) | Yes |
| GET | `/orders/my` | My orders | Yes |
| GET | `/orders/:orderId` | Order by orderId (e.g. TEATO-xxx) | Yes |

---

## Reviews

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reviews/menu-item/:id` | Reviews for menu item | No |
| POST | `/reviews` | Add review (menuItemId, rating, comment?) | Yes |

---

## Admin (role: admin or owner)

All routes require `Authorization` and role **admin** or **owner**.

| Method | Endpoint | Description | Owner only |
|--------|----------|-------------|------------|
| GET | `/admin/dashboard` | Dashboard stats | No |
| GET | `/admin/orders` | List orders (?status=, ?page=, ?limit=) | No |
| PUT | `/admin/orders/:id/status` | Update status, deliveryPerson, estimatedPrepMinutes | No |
| GET/POST/PUT/DELETE | `/admin/categories` | Categories CRUD | No |
| GET/POST/PUT/DELETE | `/admin/menu` | Menu items CRUD (POST/PUT: multipart with image) | No |
| GET/POST/PUT/DELETE | `/admin/zones` | Delivery zones CRUD | No |
| GET | `/admin/customers` | List customers | No |
| GET | `/admin/delivery-users` | List delivery users | No |
| GET | `/admin/revenue` | Revenue analytics (?startDate=, ?endDate=) | No |
| GET/POST/PUT/DELETE | `/admin/coupons` | Coupons CRUD | No |
| GET | `/admin/analytics/advanced` | Advanced analytics (revenue trend, peak hours, best-selling, retention) | No |
| GET | `/admin/analytics/best-selling` | Best-selling items report | No |
| GET/POST/PUT/DELETE | `/admin/testimonials` | Testimonials CRUD | No |
| GET/POST/PUT/DELETE | `/admin/banners` | Homepage banners CRUD | No |
| GET | `/admin/export/orders` | Export orders CSV (?startDate=, ?endDate=) | No |
| **GET** | **`/admin/users`** | **List users (?role=, ?page=, ?limit=)** | **Yes** |
| **POST** | **`/admin/users`** | **Create user (name, email, password, phone?, role: admin|kitchen|delivery)** | **Yes** |
| **PUT** | **`/admin/users/:id`** | **Update user (name, phone?, role?, isActive?)** | **Yes** |

---

## Kitchen (role: kitchen, admin, or owner)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/kitchen/orders` | Incoming orders |
| PUT | `/kitchen/orders/:id/status` | Update status (status, estimatedPrepMinutes?) |

---

## Delivery (role: delivery or admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/delivery/my-deliveries` | My assigned deliveries |
| GET | `/delivery/pending` | Pending deliveries |
| GET | `/delivery/completed` | Completed history (?page=, ?limit=) |
| GET | `/delivery/performance` | Performance stats (?days=) |
| PUT | `/delivery/orders/:id/confirm` | Confirm delivered |

---

## Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payment/create-order` | Create Razorpay order (orderId) | Yes |
| POST | `/payment/verify` | Verify Razorpay payment | Yes |

---

## Push (optional)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/push/subscribe` | Save push subscription (endpoint, keys) | Yes |

---

## Role-based access summary

| Role | Customer app | Admin panel | User management | Kitchen | Delivery |
|------|--------------|-------------|-----------------|---------|----------|
| **user** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **owner** | ✅ | ✅ Full | ✅ | ✅ | ✅ |
| **admin** | ✅ | ✅ Full | ❌ | ✅ | ✅ |
| **kitchen** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **delivery** | ✅ | ❌ | ❌ | ❌ | ✅ |

---

## Default images

Menu items without an uploaded image receive a category-based default image URL in API responses (e.g. Unsplash). No upload is required for a premium-looking menu.
