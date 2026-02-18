# TEATO - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend  
cd ../client
npm install
```

### Step 2: Setup Environment

**Backend (`server/.env`):**
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/teato
JWT_SECRET=your-secret-key-change-this
```

**Frontend (`client/.env`):**
```env
# Leave empty for dev (uses proxy)
REACT_APP_API_URL=
```

### Step 3: Start MongoDB

**Option A - Local MongoDB:**
```bash
# Windows: Install MongoDB Community or use MongoDB Atlas
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb
```

**Option B - MongoDB Atlas (Cloud):**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create cluster, get connection string
- Update `MONGODB_URI` in `server/.env`

### Step 4: Seed Database

```bash
cd server
npm run seed
```

This creates:
- ✅ **Owner:** **owner@teato.com** / **owner123** (full control + user management)
- ✅ Admin: **admin@teato.com** / **admin123**
- ✅ Kitchen: **kitchen@teato.com** / **kitchen123**
- ✅ Delivery: **delivery@teato.com** / **delivery123**
- ✅ Sample menu (14 items across 4 categories; default images used if none uploaded)
- ✅ Delivery zone (pincodes: 110001, 110002, 110003, 400001, 560001)
- ✅ Coupon: **TEATO20** (20% off, min ₹500)
- ✅ Testimonials and hero banner

### Step 5: Run the App

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
✅ Server running at http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```
✅ App opens at http://localhost:3000

---

## 🧪 Test the System

### As Customer:
1. Browse menu at http://localhost:3000
2. Add items to cart
3. Go to checkout
4. Enter address (use pincode **110001** for delivery)
5. Place order (COD or Online)
6. Track order at `/track/TEATO-...`

### As Owner or Admin:
1. Login: **owner@teato.com** / **owner123** or **admin@teato.com** / **admin123**
2. Click **Account → Admin** (or go to `/admin/dashboard`)
3. Dashboard, Orders (accept/reject, assign delivery), Menu, Delivery zones, Customers
4. **Revenue**, **Analytics** (advanced), **Coupons**, **Testimonials**, **Banners**, Export CSV
5. **Owner only:** **Users** — add/edit admins, kitchen staff, delivery partners

### As Kitchen:
1. Login: **kitchen@teato.com** / **kitchen123**
2. Click **Account → Kitchen** (or go to `/kitchen`)
3. See incoming orders in real time; Accept → Start preparing

### As Delivery:
1. Login: **delivery@teato.com** / **delivery123**
2. Click **Account → Delivery** (or go to `/delivery`)
3. View assigned deliveries; use Navigate, Call customer, Confirm delivered

---

## 🔧 Troubleshooting

**MongoDB connection error:**
- Ensure MongoDB is running: `mongod` or check Atlas connection string
- Verify `MONGODB_URI` in `server/.env`

**Port already in use:**
- Change `PORT` in `server/.env` (e.g., 5001)
- Update `CLIENT_URL` accordingly

**CORS errors:**
- Ensure `CLIENT_URL` in `server/.env` matches frontend URL
- Check browser console for exact error

**Socket.io not connecting:**
- Verify both server and client are running
- Check `CLIENT_URL` matches frontend origin

---

## 📝 Next Steps

- **Add Razorpay keys** in `server/.env` for online payments
- **Add Google Maps API key** for address picker (future)
- **Customize menu** via admin panel (default food images used until you upload)
- **Owner:** Manage users (Admins, Kitchen, Delivery) under **Admin → Users**
- **Deploy** using guides in `docs/DEPLOYMENT.md`

---

## 🎯 Default Credentials

| Role    | Email              | Password   |
|---------|--------------------|------------|
| Owner   | owner@teato.com    | owner123   |
| Admin   | admin@teato.com    | admin123   |
| Kitchen | kitchen@teato.com  | kitchen123 |
| Delivery| delivery@teato.com | delivery123 |

**⚠️ Change passwords after first login!**

---

## 📖 API & docs

- **API reference:** [docs/API.md](docs/API.md) — routes, RBAC, default images
- **Environment:** Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`

---

Happy ordering! 🍽️
