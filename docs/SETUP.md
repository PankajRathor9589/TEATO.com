# TEATO – Setup Instructions

## Prerequisites

- **Node.js** 18+
- **MongoDB** 4.4+ (local or Atlas)
- **Git**

---

## 1. Clone and install

```bash
cd TEATO
# Server
cd server && npm install && cd ..
# Client
cd client && npm install && cd ..
```

---

## 2. Environment variables

### Server (`server/.env`)

Copy from `server/.env.example`:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

- `MONGODB_URI` – MongoDB connection string (e.g. `mongodb://localhost:27017/teato`)
- `JWT_SECRET` – Long random string for JWT signing
- `CLIENT_URL` – Frontend URL (e.g. `http://localhost:3000`) for CORS and Socket.io
- Optional: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` for online payments
- Optional: `GOOGLE_MAPS_API_KEY` for map picker (future)

### Client (`client/.env`)

Copy from `client/.env.example`:

```bash
cp client/.env.example client/.env
```

For local dev with proxy, you can leave `REACT_APP_API_URL` empty or set to `http://localhost:5000` if you run client without proxy.

---

## 3. Create uploads folder (server)

```bash
mkdir -p server/uploads
```

Or set `UPLOAD_PATH` in `server/.env` to an absolute path.

---

## 4. Seed database

```bash
cd server && npm run seed && cd ..
```

This creates:

- Admin user: **admin@teato.com** / **admin123**
- Sample categories and menu items
- Default delivery zone (sample pincodes)
- Coupon **TEATO20** (20% off, min ₹500, max ₹100)

---

## 5. Run development

**Terminal 1 – Backend:**

```bash
cd server && npm run dev
```

Server runs at `http://localhost:5000`.

**Terminal 2 – Frontend:**

```bash
cd client && npm start
```

Client runs at `http://localhost:3000` and proxies API requests to the server.

---

## 6. Verify

- Open `http://localhost:3000` – homepage and menu
- Login as **admin@teato.com** / **admin123** → open **Account → Admin** (or go to `/admin/dashboard`)
- Place a test order (use pincode from seed zone, e.g. 110001) and track at `/track/TEATO-...`

---

## Production build

```bash
# Client
cd client && npm run build
# Server
cd server && npm start
```

Set `NODE_ENV=production` and use a process manager (e.g. PM2). Serve client build with Express static or a separate web server (e.g. Nginx). See `docs/DEPLOYMENT.md`.
