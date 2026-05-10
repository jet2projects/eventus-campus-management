const express = require('express');
const router = express.Router();
const {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent,
  getMyEvents, getEventAnalytics, getFeaturedEvents,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/my-events', protect, authorize('staff', 'admin'), getMyEvents);
router.get('/:id', getEvent);
router.get('/:id/analytics', protect, authorize('staff', 'admin'), getEventAnalytics);
router.post('/', protect, authorize('staff', 'admin'), createEvent);
router.put('/:id', protect, authorize('staff', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('staff', 'admin'), deleteEvent);

module.exports = router;
