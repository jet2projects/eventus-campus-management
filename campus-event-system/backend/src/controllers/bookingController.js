const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const QRCode = require('qrcode');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res) => {
  const { eventId, quantity = 1, ticketType = 'general', attendeeDetails } = req.body;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  if (event.status !== 'approved') return res.status(400).json({ success: false, message: 'Event not available for booking' });
  if (new Date() > new Date(event.registrationDeadline)) {
    return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
  }
  if (event.tickets.available < quantity) {
    return res.status(400).json({ success: false, message: `Only ${event.tickets.available} tickets available` });
  }

  // Check duplicate booking
  const existingBooking = await Booking.findOne({ user: req.user._id, event: eventId, status: { $ne: 'cancelled' } });
  if (existingBooking) {
    return res.status(400).json({ success: false, message: 'You already have a booking for this event' });
  }

  const totalAmount = event.tickets.price * quantity;

  const booking = await Booking.create({
    user: req.user._id,
    event: eventId,
    quantity,
    ticketType,
    totalAmount,
    attendeeDetails: attendeeDetails || {
      name: req.user.name,
      email: req.user.email,
    },
    status: event.tickets.isFree ? 'confirmed' : 'pending',
    payment: {
      status: event.tickets.isFree ? 'completed' : 'pending',
    },
  });

  // If free event, generate QR immediately
  if (event.tickets.isFree) {
    await generateAndAttachQR(booking, event);
    // Reduce available tickets
    await Event.findByIdAndUpdate(eventId, {
      $inc: { 'tickets.available': -quantity },
      $push: { bookings: booking._id, attendees: req.user._id },
    });
  }

  // Add booking to user
  await User.findByIdAndUpdate(req.user._id, { $push: { bookings: booking._id } });

  // Emit real-time update
  const io = req.app.get('io');
  io.to(`event_${eventId}`).emit('booking_update', {
    eventId,
    availableTickets: event.tickets.available - quantity,
  });

  const populatedBooking = await Booking.findById(booking._id).populate('event', 'title date venue banner');

  // Send confirmation email
  try {
    await sendEmail({
      to: req.user.email,
      subject: `🎟️ Booking Confirmed - ${event.title}`,
      html: getBookingEmailHTML(populatedBooking, req.user),
    });
  } catch (e) { console.log('Email failed:', e.message); }

  res.status(201).json({ success: true, message: 'Booking created', data: populatedBooking });
});

// Helper: Generate QR code for booking
const generateAndAttachQR = async (booking, event) => {
  const qrData = JSON.stringify({
    bookingId: booking.bookingId,
    eventId: event._id,
    userId: booking.user,
    quantity: booking.quantity,
    timestamp: Date.now(),
  });

  const qrCodeBase64 = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'H',
    margin: 1,
    color: { dark: '#000000', light: '#FFFFFF' },
  });

  booking.qrCode = qrCodeBase64;
  booking.qrCodeData = qrData;
  await booking.save();
};

// @desc    Get my bookings
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('event', 'title date venue banner category status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: bookings,
    pagination: { current: Number(page), total: Math.ceil(total / Number(limit)), totalBookings: total },
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('event', 'title date venue banner category organizer')
    .populate('user', 'name email');

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  const isOwner = booking.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role === 'student') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.json({ success: true, data: booking });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (['cancelled', 'attended'].includes(booking.status)) {
    return res.status(400).json({ success: false, message: `Booking already ${booking.status}` });
  }

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || 'Cancelled by user';
  booking.cancelledAt = new Date();
  await booking.save();

  // Restore ticket availability
  await Event.findByIdAndUpdate(booking.event, {
    $inc: { 'tickets.available': booking.quantity },
    $pull: { attendees: req.user._id },
  });

  res.json({ success: true, message: 'Booking cancelled successfully' });
});

// @desc    Download ticket (get QR)
// @route   GET /api/bookings/:id/ticket
// @access  Private
exports.downloadTicket = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('event', 'title date venue banner')
    .populate('user', 'name email');

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  if (booking.status !== 'confirmed') {
    return res.status(400).json({ success: false, message: 'Ticket not available - booking not confirmed' });
  }

  res.json({ success: true, data: { booking, qrCode: booking.qrCode } });
});

// @desc    Check-in attendee (staff/admin)
// @route   PUT /api/bookings/:id/checkin
// @access  Private (staff, admin)
exports.checkInBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ bookingId: req.params.id });
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.isCheckedIn) return res.status(400).json({ success: false, message: 'Already checked in' });

  booking.isCheckedIn = true;
  booking.checkedInAt = new Date();
  booking.status = 'attended';
  await booking.save();

  res.json({ success: true, message: 'Check-in successful', data: booking });
});

// Email template helper
const getBookingEmailHTML = (booking, user) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <div style="background: linear-gradient(135deg, #FF6A00, #FFB347); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: white; margin: 0;">🎟️ Booking Confirmed!</h1>
    </div>
    <div style="background: #1a1a2e; padding: 30px; color: #eee;">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your booking for <strong>${booking.event?.title}</strong> has been confirmed!</p>
      <div style="background: rgba(255,106,0,0.1); border: 1px solid #FF6A00; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
        <p><strong>Date:</strong> ${new Date(booking.event?.date?.start).toLocaleDateString()}</p>
        <p><strong>Venue:</strong> ${booking.event?.venue?.name}</p>
        <p><strong>Tickets:</strong> ${booking.quantity}</p>
        <p><strong>Amount:</strong> ₹${booking.totalAmount || 'FREE'}</p>
      </div>
      <p>Login to your dashboard to download your QR code ticket.</p>
      <p style="color: #FF6A00;">🔥 See you there, ninja!</p>
    </div>
  </div>
`;
