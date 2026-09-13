const User = require('../models/User');
const Post = require('../models/Post');
const Project = require('../models/Project');
const Community = require('../models/Community');
const Event = require('../models/Event');

// GET /api/search?q=&type=&page=
const search = async (req, res) => {
  try {
    const { q = '', type = 'all', page = 1, limit = 10 } = req.query;
    if (!q.trim()) return res.json({ success: true, results: {} });

    const results = {};
    const textQuery = { $text: { $search: q } };
    const regexQuery = { $regex: q, $options: 'i' };
    const skip = (page - 1) * limit;

    if (type === 'all' || type === 'users') {
      const users = await User.find({ isActive: true, $or: [{ username: regexQuery }, { fullName: regexQuery }, { department: regexQuery }] })
        .select('username fullName avatar department followersCount')
        .limit(Number(limit)).skip(skip);
      results.users = users;
    }

    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({ isDeleted: false, content: regexQuery })
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .limit(Number(limit)).skip(skip);
      results.posts = posts;
    }

    if (type === 'all' || type === 'projects') {
      const projects = await Project.find({ isDeleted: false, $or: [{ title: regexQuery }, { description: regexQuery }] })
        .populate('author', 'username fullName avatar')
        .sort({ likesCount: -1 })
        .limit(Number(limit)).skip(skip);
      results.projects = projects;
    }

    if (type === 'all' || type === 'communities') {
      const communities = await Community.find({ $or: [{ name: regexQuery }, { description: regexQuery }] })
        .populate('creator', 'username fullName avatar')
        .sort({ membersCount: -1 })
        .limit(Number(limit)).skip(skip);
      results.communities = communities;
    }

    if (type === 'all' || type === 'events') {
      const events = await Event.find({ $or: [{ title: regexQuery }, { description: regexQuery }] })
        .populate('organizer', 'username fullName avatar')
        .sort({ date: 1 })
        .limit(Number(limit)).skip(skip);
      results.events = events;
    }

    res.json({ success: true, query: q, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/trending
const getTrending = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [trendingPosts, trendingProjects, popularCommunities, upcomingEvents] = await Promise.all([
      Post.find({ isDeleted: false, createdAt: { $gte: twentyFourHoursAgo } })
        .populate('author', 'username fullName avatar')
        .sort({ likesCount: -1, commentsCount: -1 })
        .limit(5),

      Project.find({ isDeleted: false })
        .populate('author', 'username fullName avatar')
        .sort({ likesCount: -1 })
        .limit(6),

      Community.find({})
        .sort({ membersCount: -1 })
        .limit(5),

      Event.find({ status: 'upcoming', date: { $gte: new Date() } })
        .populate('organizer', 'username fullName avatar')
        .sort({ date: 1 })
        .limit(3),
    ]);

    res.json({ success: true, trendingPosts, trendingProjects, popularCommunities, upcomingEvents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { search, getTrending };
