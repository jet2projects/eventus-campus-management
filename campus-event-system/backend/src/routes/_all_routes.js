// routes/bookings.js
const express = require('express');
const bookingRouter = express.Router();
const {
  createBooking, getMyBookings, getBooking,
  cancelBooking, downloadTicket, checkInBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

bookingRouter.post('/', protect, createBooking);
bookingRouter.get('/my', protect, getMyBookings);
bookingRouter.get('/:id', protect, getBooking);
bookingRouter.put('/:id/cancel', protect, cancelBooking);
bookingRouter.get('/:id/ticket', protect, downloadTicket);
bookingRouter.put('/:id/checkin', protect, authorize('staff', 'admin'), checkInBooking);

// routes/payments.js
const paymentRouter = express.Router();
const { createOrder, verifyPayment, getPaymentStatus } = require('../controllers/paymentController');

paymentRouter.post('/create-order', protect, createOrder);
paymentRouter.post('/verify', protect, verifyPayment);
paymentRouter.get('/:bookingId/status', protect, getPaymentStatus);

// routes/admin.js
const adminRouter = express.Router();
const {
  getDashboardAnalytics, getAllUsers, toggleUserStatus, updateUserRole,
  reviewEvent, toggleFeatured, getAllEvents,
} = require('../controllers/adminController');
const adminProtect = require('../middleware/auth');

adminRouter.use(protect, authorize('admin'));
adminRouter.get('/analytics', getDashboardAnalytics);
adminRouter.get('/users', getAllUsers);
adminRouter.put('/users/:id/toggle', toggleUserStatus);
adminRouter.put('/users/:id/role', updateUserRole);
adminRouter.get('/events', getAllEvents);
adminRouter.put('/events/:id/review', reviewEvent);
adminRouter.put('/events/:id/feature', toggleFeatured);

// routes/users.js
const userRouter = express.Router();
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

userRouter.get('/search', protect, asyncHandler(async (req, res) => {
  const { q } = req.query;
  const users = await User.find({
    $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }],
    isActive: true,
  }).select('name email avatar role department').limit(10);
  res.json({ success: true, data: users });
}));

userRouter.get('/:id/notifications', protect, asyncHandler(async (req, res) => {
  if (req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  const user = await User.findById(req.params.id).select('notifications');
  res.json({ success: true, data: user.notifications.reverse() });
}));

userRouter.put('/:id/notifications/read', protect, asyncHandler(async (req, res) => {
  await User.updateOne(
    { _id: req.params.id },
    { $set: { 'notifications.$[].read': true } }
  );
  res.json({ success: true, message: 'All notifications marked as read' });
}));

// routes/uploads.js
const uploadRouter = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

uploadRouter.post('/image', protect, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ success: true, url, filename: req.file.filename });
});

uploadRouter.post('/images', protect, upload.array('images', 5), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'No files uploaded' });
  const urls = req.files.map(f => ({
    url: `${req.protocol}://${req.get('host')}/uploads/${f.filename}`,
    filename: f.filename,
  }));
  res.json({ success: true, urls });
});

module.exports = { bookingRouter, paymentRouter, adminRouter, userRouter, uploadRouter };
