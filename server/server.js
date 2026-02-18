/**
 * TEATO - Food Ordering Platform - Backend Entry Point
 * Express + MongoDB + Socket.io
 */
require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { setIO } = require('./utils/socket');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const contentRoutes = require('./routes/contentRoutes');
const pushRoutes = require('./routes/pushRoutes');
const adminRoutes = require('./routes/adminRoutes');
const kitchenRoutes = require('./routes/kitchenRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
});
setIO(io);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  message: { success: false, message: 'Too many requests. Try again later.' },
});
app.use(limiter);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

if (process.env.UPLOAD_PATH) {
  app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_PATH)));
}

app.get('/health', (req, res) => res.json({ ok: true, service: 'teato-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/delivery', deliveryRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`TEATO server running on port ${PORT}`);
});
