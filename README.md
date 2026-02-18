# TEATO – Online Food Ordering Platform

A production-ready, single-restaurant food ordering system similar to Swiggy/Zomato, built for the **TEATO** brand.

## Tech stack

- **Frontend:** React 18, Tailwind CSS, React Router, Socket.io client, PWA-ready
- **Backend:** Node.js, Express, JWT, Socket.io
- **Database:** MongoDB (Mongoose)
- **Payments:** Razorpay (India)
- **Maps:** Google Maps API ready (env placeholder)
- **Deployment:** Docker, Vercel, AWS-ready

## Features (Zomato-inspired UX)

### Customer experience

- **Location-based ordering** — Set delivery pincode on home; used at checkout
- **Menu with large food images** and ratings (★) display
- **Popular items** section on home (by order count)
- **Offers & coupons banner** on home; coupon input at checkout
- **Ratings & reviews** — Review model; menu items show avgRating and reviewCount
- Add to cart with quantity controls, guest or login checkout
- Real-time order tracking (Socket.io)
- **Reorder** previous orders (one tap adds items to cart)
- Mobile-first, accessible UI

### Owner / Admin panel (not visible to customers)

- Dashboard (orders today, revenue, pending count)
- Order management (accept/reject, status updates, assign delivery)
- Menu management (categories, items, image upload)
- **Revenue analytics** (date range, grouped by day/month)
- Customer data view
- **Coupon management** (CRUD)
- Delivery zones, CSV export

### Kitchen staff panel

- **Incoming orders screen** (real-time via Socket.io)
- Status updates: Accept → Start preparing

### Delivery panel

- **Assigned deliveries** list
- **Navigate** (Google Maps link) and **Call customer**
- **Delivery confirmation** (mark delivered)

### Security & roles

- **Strict role-based access:** `user`, `admin`, `kitchen`, `delivery`
- JWT + HTTP-only cookie, rate limiting, CORS, input sanitization
- Management panels only for assigned roles

## Project structure

```
TEATO/
├── client/                 # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json   # PWA
│   ├── src/
│   │   ├── components/     # Layout, AdminLayout
│   │   ├── context/        # Auth, Cart
│   │   ├── hooks/          # useSocket
│   │   ├── pages/          # Home, Menu, Cart, Checkout, Track, Orders, Login, Register, Profile, Addresses
│   │   ├── pages/admin/    # Dashboard, Orders, Menu, Zones, Customers
│   │   ├── services/       # api.js
│   │   └── App.js, index.js, index.css
│   ├── .env.example
│   └── package.json
├── server/                 # Node backend
│   ├── config/             # db, razorpay
│   ├── controllers/        # auth, menu, order, payment, admin
│   ├── middleware/         # auth, errorHandler, upload
│   ├── models/             # User, Category, MenuItem, Order, DeliveryZone, Coupon
│   ├── routes/             # auth, menu, order, payment, admin
│   ├── scripts/seed.js     # Sample data + admin user
│   ├── utils/socket.js     # Socket.io server
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── API.md              # API reference
│   ├── SETUP.md            # Step-by-step setup
│   └── DEPLOYMENT.md       # Vercel, Docker, AWS
├── docker-compose.yml
└── README.md
```

## Quick start

**📖 See [QUICKSTART.md](QUICKSTART.md) for detailed step-by-step instructions.**

**Quick version:**

1. **Run setup script** (Windows: `setup.bat` | Mac/Linux: `chmod +x setup.sh && ./setup.sh`)

2. **Configure MongoDB** in `server/.env` (local or Atlas)

3. **Seed database:**
   ```bash
   cd server && npm run seed
   ```
   Creates admin **admin@teato.com** / **admin123**, sample menu, zones, coupon.

4. **Run:**
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev
   
   # Terminal 2: Frontend  
   cd client && npm start
   ```

5. **Access:**
   - App: http://localhost:3000  
   - API: http://localhost:5000  
   - Admin: Login → Account → Admin

**📋 See [CHECKLIST.md](CHECKLIST.md) for pre-launch verification.**

## Environment variables

- **Server:** See `server/.env.example` (MongoDB, JWT, Razorpay, CLIENT_URL, etc.).
- **Client:** See `client/.env.example` (e.g. `REACT_APP_API_URL` for production).

## Documentation

- **[Quick Start Guide](QUICKSTART.md)** – Get running in 5 minutes
- **[Pre-Launch Checklist](CHECKLIST.md)** – Verification before going live
- [Setup (detailed)](docs/SETUP.md)
- [API routes](docs/API.md)
- [Deployment (Vercel, Docker, AWS)](docs/DEPLOYMENT.md)

## Security

- JWT + HTTP-only cookie option
- Role-based access (user, admin, delivery)
- Rate limiting, Helmet, CORS, input sanitization
- Env-based config, no secrets in repo

## License

Proprietary – TEATO.
