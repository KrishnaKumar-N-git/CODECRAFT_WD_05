const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllRead);
router.put('/:id/read', markOneRead);

module.exports = router;
