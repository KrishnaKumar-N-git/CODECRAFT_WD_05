const express = require('express');
const router = express.Router();
const { search, getTrending } = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, search);
router.get('/trending', optionalAuth, getTrending);

module.exports = router;
