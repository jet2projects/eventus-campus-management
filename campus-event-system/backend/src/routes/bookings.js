const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBooking, cancelBooking, downloadTicket, checkInBooking } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.get('/:id/ticket', protect, downloadTicket);
router.put('/:id/checkin', protect, authorize('staff', 'admin'), checkInBooking);

module.exports = router;
