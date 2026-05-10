const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/search', protect, asyncHandler(async (req, res) => {
  const { q } = req.query;
  const users = await User.find({
    $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }],
    isActive: true,
  }).select('name email avatar role department').limit(10);
  res.json({ success: true, data: users });
}));

router.get('/:id/notifications', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('notifications');
  res.json({ success: true, data: user?.notifications?.reverse() || [] });
}));

router.put('/:id/notifications/read', protect, asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.params.id }, { $set: { 'notifications.$[].read': true } });
  res.json({ success: true, message: 'All notifications marked as read' });
}));

module.exports = router;
