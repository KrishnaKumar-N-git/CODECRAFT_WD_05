const User = require('../models/User');
const Post = require('../models/Post');
const Project = require('../models/Project');
const Community = require('../models/Community');
const Event = require('../models/Event');
const Report = require('../models/Report');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalPosts, totalProjects, totalCommunities, totalEvents, pendingReports] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Post.countDocuments({ isDeleted: false }),
      Project.countDocuments({ isDeleted: false }),
      Community.countDocuments(),
      Event.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ]);

    res.json({ success: true, stats: { totalUsers, activeUsers, totalPosts, totalProjects, totalCommunities, totalEvents, pendingReports } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users
const getAdminUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = {};
    if (search) query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    res.json({ success: true, users, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/users/:id/status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot deactivate admin.' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const query = status !== 'all' ? { status } : {};

    const reports = await Report.find(query)
      .populate('reporter', 'username fullName avatar')
      .populate('reviewedBy', 'username fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Report.countDocuments(query);
    res.json({ success: true, reports, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/reports/:id
const resolveReport = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote || '', reviewedBy: req.user._id },
      { new: true }
    );

    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    // If resolved, optionally delete content
    if (status === 'resolved' && req.body.deleteContent) {
      if (report.targetType === 'Post') {
        await Post.findByIdAndUpdate(report.targetId, { isDeleted: true });
      }
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/posts/:id (force delete)
const adminDeletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    post.isDeleted = true;
    await post.save();

    res.json({ success: true, message: 'Post removed by admin.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats, getAdminUsers, toggleUserStatus, getReports, resolveReport, adminDeletePost };
