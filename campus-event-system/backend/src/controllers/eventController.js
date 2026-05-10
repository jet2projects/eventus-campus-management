const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all events (with filters)
// @route   GET /api/events
// @access  Public
exports.getEvents = asyncHandler(async (req, res) => {
  const {
    category, status = 'approved', search, page = 1, limit = 12,
    sortBy = 'date.start', order = 'asc', isFree, isFeatured, upcoming,
  } = req.query;

  const query = { isPublished: true, status: 'approved' };

  if (category) query.category = category;
  if (isFree !== undefined) query['tickets.isFree'] = isFree === 'true';
  if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
  if (upcoming === 'true') query['date.start'] = { $gte: new Date() };
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const sortOrder = order === 'desc' ? -1 : 1;

  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('organizer', 'name email avatar department')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Event.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: events,
    pagination: {
      current: Number(page),
      total: Math.ceil(total / Number(limit)),
      count: events.length,
      totalEvents: total,
    },
  });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'name email avatar department')
    .populate('coOrganizers', 'name email');

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  // Increment views
  await Event.findByIdAndUpdate(req.params.id, { $inc: { 'analytics.views': 1 } });

  res.json({ success: true, data: event });
});

// @desc    Create event (staff/admin)
// @route   POST /api/events
// @access  Private (staff, admin)
exports.createEvent = asyncHandler(async (req, res) => {
  req.body.organizer = req.user._id;

  // Auto-set isFree based on price
  if (req.body.tickets) {
    req.body.tickets.isFree = req.body.tickets.price === 0;
    req.body.tickets.available = req.body.tickets.total;
  }

  // Admin events auto-approved
  if (req.user.role === 'admin') {
    req.body.status = 'approved';
    req.body.isPublished = true;
  }

  const event = await Event.create(req.body);
  await event.populate('organizer', 'name email');

  // Notify via socket
  const io = req.app.get('io');
  io.emit('new_event', { event: event._id, title: event.title });

  res.status(201).json({ success: true, message: 'Event created successfully', data: event });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (organizer or admin)
exports.updateEvent = asyncHandler(async (req, res) => {
  let event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  const isOrganizer = event.organizer.toString() === req.user._id.toString();
  if (!isOrganizer && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
  }

  // Reset to pending if staff edits
  if (req.user.role === 'staff' && event.status === 'approved') {
    req.body.status = 'pending';
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  res.json({ success: true, message: 'Event updated', data: event });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (organizer or admin)
exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  const isOrganizer = event.organizer.toString() === req.user._id.toString();
  if (!isOrganizer && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await event.deleteOne();
  res.json({ success: true, message: 'Event deleted' });
});

// @desc    Get my events (staff)
// @route   GET /api/events/my-events
// @access  Private (staff)
exports.getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: events });
});

// @desc    Get event analytics
// @route   GET /api/events/:id/analytics
// @access  Private (organizer/admin)
exports.getEventAnalytics = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  const bookings = await Booking.find({ event: req.params.id })
    .populate('user', 'name email department')
    .lean();

  const analytics = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings.filter(b => b.payment.status === 'completed').reduce((sum, b) => sum + b.totalAmount, 0),
    capacityUsed: Math.round(((event.tickets.total - event.tickets.available) / event.tickets.total) * 100),
    views: event.analytics.views,
    departmentBreakdown: bookings.reduce((acc, b) => {
      const dept = b.user?.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {}),
    bookings,
  };

  res.json({ success: true, data: analytics });
});

// @desc    Get featured/recommended events
// @route   GET /api/events/featured
// @access  Public
exports.getFeaturedEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({
    isFeatured: true, status: 'approved', isPublished: true,
    'date.start': { $gte: new Date() },
  })
    .populate('organizer', 'name avatar')
    .limit(6)
    .lean();

  res.json({ success: true, data: events });
});
