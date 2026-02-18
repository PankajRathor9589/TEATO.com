/**
 * User model - customers, admins, delivery personnel.
 * Supports role-based access: user, admin, delivery
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^[6-9]\d{9}$/.test(v),
        message: 'Please provide a valid 10-digit Indian phone number',
      },
    },
    password: {
      type: String,
      required: function () {
        return this.role !== 'guest';
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'owner', 'admin', 'kitchen', 'delivery', 'guest'],
      default: 'user',
    },
    addresses: [
      {
        label: { type: String, default: 'Home' },
        line1: { type: String, required: true },
        line2: { type: String },
        city: { type: String, required: true },
        state: { type: String },
        pincode: { type: String, required: true },
        lat: { type: Number },
        lng: { type: Number },
        isDefault: { type: Boolean, default: false },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
