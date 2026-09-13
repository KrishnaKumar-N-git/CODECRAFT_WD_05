const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  attendEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// Public / optional auth
router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEvent);

// Protected
router.post('/', protect, uploadImage.single('image'), createEvent);
router.post('/:id/rsvp', protect, attendEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
