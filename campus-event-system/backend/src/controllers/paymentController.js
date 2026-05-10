const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const QRCode = require('qrcode');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId).populate('event', 'title');
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  if (booking.totalAmount === 0) {
    return res.status(400).json({ success: false, message: 'This is a free event' });
  }

  const options = {
    amount: booking.totalAmount * 100, // paise
    currency: 'INR',
    receipt: booking.bookingId,
    notes: {
      bookingId: booking._id.toString(),
      eventTitle: booking.event.title,
      userId: req.user._id.toString(),
    },
  };

  const order = await razorpay.orders.create(options);

  booking.payment.razorpayOrderId = order.id;
  await booking.save();

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        amount: booking.totalAmount,
      },
      user: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
      },
    },
  });
});

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  // Update booking
  const booking = await Booking.findById(bookingId).populate('event');
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  booking.payment.status = 'completed';
  booking.payment.razorpayPaymentId = razorpay_payment_id;
  booking.payment.razorpaySignature = razorpay_signature;
  booking.payment.paidAt = new Date();
  booking.payment.method = 'razorpay';
  booking.status = 'confirmed';

  // Generate QR code
  const qrData = JSON.stringify({
    bookingId: booking.bookingId,
    eventId: booking.event._id,
    userId: booking.user,
    quantity: booking.quantity,
    timestamp: Date.now(),
  });

  booking.qrCode = await QRCode.toDataURL(qrData, { errorCorrectionLevel: 'H' });
  booking.qrCodeData = qrData;
  await booking.save();

  // Reduce event tickets
  await Event.findByIdAndUpdate(booking.event._id, {
    $inc: { 'tickets.available': -booking.quantity },
    $push: { bookings: booking._id, attendees: booking.user },
  });

  // Send confirmation email
  try {
    await sendEmail({
      to: req.user.email,
      subject: `✅ Payment Successful - ${booking.event.title}`,
      html: `
        <h2>Payment Confirmed! 🎉</h2>
        <p>Your payment of ₹${booking.totalAmount} for <strong>${booking.event.title}</strong> was successful.</p>
        <p><strong>Transaction ID:</strong> ${razorpay_payment_id}</p>
        <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
        <p>Login to download your QR ticket!</p>
      `,
    });
  } catch (e) { console.log('Email failed'); }

  // Emit socket event
  const io = req.app.get('io');
  io.to(`event_${booking.event._id}`).emit('payment_success', {
    bookingId: booking.bookingId,
    eventId: booking.event._id,
  });

  res.json({
    success: true,
    message: 'Payment verified successfully',
    data: {
      bookingId: booking.bookingId,
      transactionId: razorpay_payment_id,
      status: 'confirmed',
    },
  });
});

// @desc    Get payment status
// @route   GET /api/payments/:bookingId/status
// @access  Private
exports.getPaymentStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId).select('payment status bookingId');
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  res.json({ success: true, data: { payment: booking.payment, status: booking.status } });
});
