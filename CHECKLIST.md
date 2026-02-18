# TEATO - Pre-Launch Checklist

## ✅ Setup Verification

- [ ] MongoDB running (local or Atlas)
- [ ] `server/.env` configured with:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET` (strong random string)
  - [ ] `CLIENT_URL` (matches frontend URL)
- [ ] `client/.env` configured (optional for dev)
- [ ] Dependencies installed (`npm install` in both folders)
- [ ] Database seeded (`npm run seed` in server)
- [ ] Uploads directory created (`server/uploads`)

## ✅ Functionality Tests

### Customer Flow
- [ ] Browse menu, search works
- [ ] Add items to cart, quantity updates
- [ ] Checkout flow (guest and logged-in)
- [ ] Address entry/selection
- [ ] Order placement (COD)
- [ ] Order tracking page loads
- [ ] Real-time status updates (Socket.io)
- [ ] Order history shows orders

### Admin Flow
- [ ] Login as admin
- [ ] Dashboard shows stats
- [ ] View orders list
- [ ] Accept/Reject order
- [ ] Update order status (Preparing → Out for Delivery → Delivered)
- [ ] Create/Edit/Delete category
- [ ] Create/Edit/Delete menu item
- [ ] Upload menu item image
- [ ] Manage delivery zones
- [ ] View customers list
- [ ] Export orders CSV

### Payment (if Razorpay configured)
- [ ] Online payment option shows
- [ ] Razorpay checkout opens
- [ ] Payment verification works

## ✅ Security Checks

- [ ] `.env` files in `.gitignore`
- [ ] No secrets in code
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Input validation working
- [ ] Admin routes protected
- [ ] JWT tokens expire correctly

## ✅ Performance

- [ ] Images optimized (if using real images)
- [ ] API responses reasonable (< 500ms)
- [ ] Socket.io connections stable
- [ ] No memory leaks (check in dev tools)

## ✅ Production Readiness

- [ ] `NODE_ENV=production` set
- [ ] Error handling works
- [ ] Logging configured (if needed)
- [ ] Health check endpoint (`/health`) works
- [ ] Static files served correctly
- [ ] PWA manifest valid (if using PWA)

## 🚀 Deployment

- [ ] Backend deployed (Railway/Render/AWS)
- [ ] Frontend deployed (Vercel/Netlify)
- [ ] Environment variables set in hosting
- [ ] MongoDB Atlas connection working
- [ ] Domain configured (if custom)
- [ ] SSL certificate active
- [ ] Test full flow on production

## 📝 Post-Launch

- [ ] Change default admin password
- [ ] Set up monitoring (optional)
- [ ] Configure Razorpay webhook (if using)
- [ ] Add real menu items and images
- [ ] Set up delivery zones for your area
- [ ] Test on mobile devices
- [ ] Check accessibility (keyboard nav, screen readers)

---

**Note:** This checklist helps ensure a smooth launch. Check off items as you complete them!
