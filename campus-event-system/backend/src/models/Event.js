const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters'],
  },
  category: {
    type: String,
    required: true,
    enum: ['technical', 'cultural', 'sports', 'workshop', 'seminar', 'hackathon', 'social', 'other'],
  },
  tags: [String],
  banner: {
    type: String,
    default: null,
  },
  images: [String],
  venue: {
    name: { type: String, required: true },
    address: String,
    capacity: { type: Number, required: true },
    mapLink: String,
  },
  date: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  registrationDeadline: {
    type: Date,
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coOrganizers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  tickets: {
    total: { type: Number, required: true },
    available: { type: Number, required: true },
    price: { type: Number, default: 0 },
    isFree: { type: Boolean, default: true },
    types: [{
      name: String,
      price: Number,
      quantity: Number,
      available: Number,
    }],
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending',
  },
  adminFeedback: String,
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  }],
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  waitlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  },
  requirements: String,
  speakers: [{
    name: String,
    designation: String,
    bio: String,
    avatar: String,
  }],
  schedule: [{
    time: String,
    activity: String,
    speaker: String,
  }],
  faqs: [{
    question: String,
    answer: String,
  }],
}, { timestamps: true });

// Index for search
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ 'date.start': 1 });
eventSchema.index({ category: 1, status: 1 });

// Virtual for booking count
eventSchema.virtual('bookingCount').get(function () {
  return this.bookings.length;
});

// Virtual for availability percentage
eventSchema.virtual('availabilityPercent').get(function () {
  return Math.round((this.tickets.available / this.tickets.total) * 100);
});

module.exports = mongoose.model('Event', eventSchema);
