const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, getAllUsers, toggleUserStatus, updateUserRole, reviewEvent, toggleFeatured, getAllEvents } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/analytics', getDashboardAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/users/:id/role', updateUserRole);
router.get('/events', getAllEvents);
router.put('/events/:id/review', reviewEvent);
router.put('/events/:id/feature', toggleFeatured);

module.exports = router;
