const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserPosts,
  getUserProjects
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

// Public / optional auth routes
router.get('/', optionalAuth, getUsers);
router.get('/:id', optionalAuth, getUserById);
router.get('/:id/posts', optionalAuth, getUserPosts);
router.get('/:id/projects', optionalAuth, getUserProjects);
router.get('/:id/followers', optionalAuth, getFollowers);
router.get('/:id/following', optionalAuth, getFollowing);

// Protected routes
router.put('/profile', protect, uploadAvatar.single('avatar'), updateUser);
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);

module.exports = router;
