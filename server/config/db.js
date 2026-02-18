/**
 * MongoDB connection configuration.
 * Uses Mongoose for ODM and connection pooling.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // ✅ FIX: Use MONGO_URI (matches .env)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

module.exports = connectDB;
