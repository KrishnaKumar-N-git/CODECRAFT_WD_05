const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  deleteProject,
  toggleLikeProject
} = require('../controllers/projectController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// Public / optional auth
router.get('/', optionalAuth, getProjects);
router.get('/:id', optionalAuth, getProject);

// Protected
router.post('/', protect, uploadImage.single('image'), createProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/like', protect, toggleLikeProject);

module.exports = router;
