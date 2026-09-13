const express = require('express');
const router = express.Router();
const {
  getStats,
  getAdminUsers,
  toggleUserStatus,
  getReports,
  resolveReport,
  adminDeletePost
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/status', toggleUserStatus);
router.get('/reports', getReports);
router.put('/reports/:id', resolveReport);
router.delete('/posts/:id', adminDeletePost);

module.exports = router;
