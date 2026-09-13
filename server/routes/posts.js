const express = require('express');
const router = express.Router();
const {
  getFeed,
  getTrendingPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadPostMedia } = require('../middleware/upload');

// Feed and Trending
router.get('/feed', optionalAuth, getFeed);
router.get('/trending', optionalAuth, getTrendingPosts);

// Single Post
router.get('/:id', optionalAuth, getPost);

// Protected actions
router.post('/', protect, uploadPostMedia.array('media', 4), createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);

module.exports = router;
