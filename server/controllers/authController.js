/**
 * Authentication: register, login, getMe, updateProfile, addAddress
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };
  res.cookie('token', token, options);
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, user });
};

exports.register = async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered.' });
  }
  const user = await User.create({ name, email: email.toLowerCase(), password, phone, role: 'user' });
  sendToken(user, 201, res);
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account is disabled.' });
  }
  sendToken(user, 200, res);
};

exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
};

exports.updateProfile = async (req, res, next) => {
  const allowed = ['name', 'phone'];
  const updates = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });
  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  res.status(200).json({ success: true, user });
};

exports.addAddress = async (req, res, next) => {
  const { label, line1, line2, city, state, pincode, lat, lng, isDefault } = req.body;
  if (!line1 || !city || !pincode) {
    return res.status(400).json({ success: false, message: 'Address line1, city and pincode are required.' });
  }
  const user = await User.findById(req.user.id);
  const newAddr = { label: label || 'Home', line1, line2, city, state, pincode, lat, lng, isDefault: !!isDefault };
  if (newAddr.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(newAddr);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
};

exports.updateAddress = async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(req.user.id);
  const addr = user.addresses.id(id);
  if (!addr) return res.status(404).json({ success: false, message: 'Address not found.' });
  const { label, line1, line2, city, state, pincode, lat, lng, isDefault } = req.body;
  if (label !== undefined) addr.label = label;
  if (line1 !== undefined) addr.line1 = line1;
  if (line2 !== undefined) addr.line2 = line2;
  if (city !== undefined) addr.city = city;
  if (state !== undefined) addr.state = state;
  if (pincode !== undefined) addr.pincode = pincode;
  if (lat !== undefined) addr.lat = lat;
  if (lng !== undefined) addr.lng = lng;
  if (isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
    addr.isDefault = true;
  }
  await user.save();
  res.status(200).json({ success: true, addresses: user.addresses });
};

exports.deleteAddress = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  user.addresses.pull(req.params.id);
  await user.save();
  res.status(200).json({ success: true, addresses: user.addresses });
};

exports.logout = (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out.' });
};
