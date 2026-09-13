const express = require('express');
const router = express.Router();
const {
  getCommunities,
  getCommunity,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getMembers,
  getCommunityPosts
} = require('../controllers/communityController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// Public / optional auth
router.get('/', optionalAuth, getCommunities);
router.get('/:slug', optionalAuth, getCommunity);
router.get('/:id/members', getMembers);
router.get('/:id/posts', optionalAuth, getCommunityPosts);

// Protected
router.post('/', protect, uploadImage.single('avatar'), createCommunity);
router.post('/:id/join', protect, joinCommunity);
router.delete('/:id/leave', protect, leaveCommunity);

module.exports = router;
