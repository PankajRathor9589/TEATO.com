/**
 * Razorpay payment gateway configuration.
 * Used only when keys are set; otherwise COD/placeholder is used.
 */
const Razorpay = require('razorpay');

let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

module.exports = razorpayInstance;
