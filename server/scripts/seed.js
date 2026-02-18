/**
 * Seed script: admin user, categories, menu items, delivery zones, sample coupon
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const DeliveryZone = require('../models/DeliveryZone');
const Coupon = require('../models/Coupon');
const Testimonial = require('../models/Testimonial');
const HomeBanner = require('../models/HomeBanner');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teato';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const existingOwner = await User.findOne({ email: 'owner@teato.com' });
  if (!existingOwner) {
    await User.create({
      name: 'TEATO Owner',
      email: 'owner@teato.com',
      password: 'owner123',
      role: 'owner',
      phone: '9876543200',
    });
    console.log('Owner created: owner@teato.com / owner123');
  }
  const existingAdmin = await User.findOne({ email: 'admin@teato.com' });
  if (!existingAdmin) {
    await User.create({
      name: 'TEATO Admin',
      email: 'admin@teato.com',
      password: 'admin123',
      role: 'admin',
      phone: '9876543210',
    });
    console.log('Admin created: admin@teato.com / admin123');
  }
  const existingKitchen = await User.findOne({ email: 'kitchen@teato.com' });
  if (!existingKitchen) {
    await User.create({
      name: 'Kitchen Staff',
      email: 'kitchen@teato.com',
      password: 'kitchen123',
      role: 'kitchen',
      phone: '9876543211',
    });
    console.log('Kitchen created: kitchen@teato.com / kitchen123');
  }
  const existingDelivery = await User.findOne({ email: 'delivery@teato.com' });
  if (!existingDelivery) {
    await User.create({
      name: 'Delivery Partner',
      email: 'delivery@teato.com',
      password: 'delivery123',
      role: 'delivery',
      phone: '9876543212',
    });
    console.log('Delivery created: delivery@teato.com / delivery123');
  }

  const catNames = [
    { name: 'Starters', sortOrder: 1 },
    { name: 'Main Course', sortOrder: 2 },
    { name: 'Beverages', sortOrder: 3 },
    { name: 'Desserts', sortOrder: 4 },
  ];
  const categoryIds = {};
  for (const c of catNames) {
    const slug = c.name.toLowerCase().replace(/\s+/g, '-');
    let cat = await Category.findOne({ slug });
    if (!cat) {
      cat = await Category.create({ name: c.name, slug, sortOrder: c.sortOrder });
    }
    categoryIds[c.name] = cat._id;
  }
  console.log('Categories ready');

  const items = [
    { name: 'Veg Spring Rolls', category: 'Starters', price: 120, veg: true },
    { name: 'Chicken Wings', category: 'Starters', price: 180, veg: false },
    { name: 'Garlic Bread', category: 'Starters', price: 99, veg: true },
    { name: 'Paneer Tikka', category: 'Starters', price: 199, veg: true },
    { name: 'Dal Makhani', category: 'Main Course', price: 220, veg: true },
    { name: 'Butter Chicken', category: 'Main Course', price: 280, veg: false },
    { name: 'Veg Biryani', category: 'Main Course', price: 210, veg: true },
    { name: 'Chicken Biryani', category: 'Main Course', price: 260, veg: false },
    { name: 'Masala Dosa', category: 'Main Course', price: 150, veg: true },
    { name: 'Fresh Lime Soda', category: 'Beverages', price: 60, veg: true },
    { name: 'Mango Lassi', category: 'Beverages', price: 80, veg: true },
    { name: 'Cold Coffee', category: 'Beverages', price: 90, veg: true },
    { name: 'Gulab Jamun', category: 'Desserts', price: 80, veg: true },
    { name: 'Chocolate Brownie', category: 'Desserts', price: 150, veg: true },
  ];
  for (const i of items) {
    const slug = i.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const exists = await MenuItem.findOne({ slug });
    if (!exists) {
      await MenuItem.create({
        name: i.name,
        slug,
        category: categoryIds[i.category],
        price: i.price,
        veg: i.veg,
        isAvailable: true,
      });
    }
  }
  console.log('Menu items ready');

  const zoneExists = await DeliveryZone.findOne({});
  if (!zoneExists) {
    await DeliveryZone.create({
      name: 'Default Zone',
      pincodes: ['110001', '110002', '110003', '400001', '560001'],
      deliveryFee: 40,
      minOrderAmount: 199,
      estimatedMinutes: 45,
    });
    console.log('Delivery zone created');
  }

  const couponExists = await Coupon.findOne({ code: 'TEATO20' });
  if (!couponExists) {
    await Coupon.create({
      code: 'TEATO20',
      type: 'percent',
      value: 20,
      minOrderAmount: 500,
      maxDiscount: 100,
      isActive: true,
    });
    console.log('Coupon TEATO20 created (20% off, min ₹500, max ₹100)');
  }

  // Ensure MenuItem has orderCount for popular sorting (existing items may not have it)
  await MenuItem.updateMany({ orderCount: { $exists: false } }, { $set: { orderCount: 0 } });

  if (!(await Testimonial.findOne({}))) {
    await Testimonial.create([
      { customerName: 'Priya S.', text: 'Fast delivery and food was fresh. Will order again!', rating: 5, sortOrder: 1 },
      { customerName: 'Rahul M.', text: 'Best biryani in town. TEATO never disappoints.', rating: 5, sortOrder: 2 },
    ]);
    console.log('Testimonials created');
  }

  if (!(await HomeBanner.findOne({ type: 'hero' }))) {
    await HomeBanner.create({ title: 'TEATO', subtitle: 'Premium food, delivered fresh', type: 'hero', sortOrder: 0, isActive: true });
    console.log('Hero banner created');
  }

  console.log('Seed completed.');
  console.log('Roles: owner@teato.com (owner), admin@teato.com (admin), kitchen@teato.com (kitchen), delivery@teato.com (delivery)');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
