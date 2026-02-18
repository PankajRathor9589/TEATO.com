/**
 * Order model - customer orders with status tracking and payment info
 */
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  selectedAddons: [{ name: String, optionName: String, price: Number }],
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true }, // Human-readable: TEATO-20240215-0001
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestEmail: { type: String },
    guestPhone: { type: String },
    guestName: { type: String },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    total: { type: Number, required: true, min: 0 },
    deliveryAddress: {
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String },
      pincode: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number },
      instructions: { type: String },
    },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'preparing', 'out_for_delivery', 'delivered'],
      default: 'pending',
    },
    deliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    estimatedPrepMinutes: { type: Number, default: 15 },
    scheduledAt: { type: Date },
    deliveredAt: { type: Date },
    rejectedReason: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ orderId: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

// Generate orderId before save
orderSchema.pre('save', async function (next) {
  if (this.orderId) return next();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await mongoose.model('Order').countDocuments({
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });
  this.orderId = `TEATO-${date}-${String(count + 1).padStart(4, '0')}`;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
