/**
 * Web Push: save subscription for logged-in user (PWA notifications)
 */
const PushSubscription = require('../models/PushSubscription');

exports.subscribe = async (req, res, next) => {
  const { endpoint, keys, userAgent } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ success: false, message: 'endpoint and keys (p256dh, auth) required.' });
  }
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { user: req.user.id, endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth }, userAgent },
    { upsert: true, new: true }
  );
  res.status(200).json({ success: true });
};

exports.unsubscribe = async (req, res, next) => {
  await PushSubscription.deleteMany({ user: req.user.id });
  res.status(200).json({ success: true });
};
