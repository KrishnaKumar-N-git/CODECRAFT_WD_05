const express = require('express');
const router = express.Router();
const {
  getComments,
  createComment,
  deleteComment,
  likeComment
} = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getComments);
router.post('/', protect, createComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, likeComment);

module.exports = router;
