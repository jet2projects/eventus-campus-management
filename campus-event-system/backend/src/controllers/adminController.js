const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (admin)
exports.getDashboardAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalEvents, totalBookings, revenueData] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments(),
    Booking.countDocuments(),
    Booking.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]),
  ]);

  // Events by status
  const eventsByStatus = await Event.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Bookings by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const bookingsByMonth = await Booking.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Events by category
  const eventsByCategory = await Event.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  // User roles breakdown
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  // Recent activity
  const recentBookings = await Booking.find()
    .populate('user', 'name email')
    .populate('event', 'title')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const pendingEvents = await Event.find({ status: 'pending' })
    .populate('organizer', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
      },
      charts: {
        eventsByStatus,
        bookingsByMonth,
        eventsByCategory,
        usersByRole,
      },
      recentBookings,
      pendingEvents,
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20, search, isActive } = req.query;
  const query = {};

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { current: Number(page), total: Math.ceil(total / Number(limit)), totalUsers: total },
  });
});

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/toggle
// @access  Private (admin)
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot deactivate admin' });

  user.isActive = !user.isActive;
  await user.save();

  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (admin)
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['student', 'staff', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  res.json({ success: true, message: 'User role updated', data: user });
});

// @desc    Approve/reject event
// @route   PUT /api/admin/events/:id/review
// @access  Private (admin)
exports.reviewEvent = asyncHandler(async (req, res) => {
  const { action, feedback } = req.body; // action: 'approve' | 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid action' });
  }

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    {
      status: action === 'approve' ? 'approved' : 'rejected',
      isPublished: action === 'approve',
      adminFeedback: feedback,
    },
    { new: true }
  ).populate('organizer', 'name email');

  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  // Notify organizer via socket
  const io = req.app.get('io');
  io.emit('event_reviewed', { eventId: event._id, status: event.status, organizer: event.organizer._id });

  res.json({ success: true, message: `Event ${action}d`, data: event });
});

// @desc    Toggle event featured
// @route   PUT /api/admin/events/:id/feature
// @access  Private (admin)
exports.toggleFeatured = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  event.isFeatured = !event.isFeatured;
  await event.save();

  res.json({ success: true, message: `Event ${event.isFeatured ? 'featured' : 'unfeatured'}`, data: event });
});

// @desc    Get all events (admin view)
// @route   GET /api/admin/events
// @access  Private (admin)
exports.getAllEvents = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Event.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: events,
    pagination: { current: Number(page), total: Math.ceil(total / Number(limit)), totalEvents: total },
  });
});
