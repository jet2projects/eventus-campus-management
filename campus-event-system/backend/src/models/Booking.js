const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: () => `BK-${uuidv4().split('-')[0].toUpperCase()}`,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  ticketType: {
    type: String,
    default: 'general',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'attended', 'refunded'],
    default: 'pending',
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    method: String,
    transactionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paidAt: Date,
  },
  qrCode: {
    type: String, // base64 QR image
    default: null,
  },
  qrCodeData: {
    type: String, // JSON string embedded in QR
    default: null,
  },
  isCheckedIn: { type: Boolean, default: false },
  checkedInAt: Date,
  cancellationReason: String,
  cancelledAt: Date,
  attendeeDetails: {
    name: String,
    email: String,
    phone: String,
    rollNo: String,
  },
}, { timestamps: true });

bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ 'payment.status': 1 });

module.exports = mongoose.model('Booking', bookingSchema);
