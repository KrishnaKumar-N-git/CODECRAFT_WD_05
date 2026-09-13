const User = require('../models/User');
const Post = require('../models/Post');
const Project = require('../models/Project');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const { deleteFromCloudinary } = require('../middleware/upload');

// GET /api/users?search=&page=&limit=
const getUsers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    if (search) {
      query.$text = { $search: search };
    }

    const users = await User.find(query)
      .sort(search ? { score: { $meta: 'textScore' } } : { followersCount: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
        { username: req.params.id },
      ],
      isActive: true,
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Check if current user follows this user
    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({ follower: req.user._id, following: user._id });
      isFollowing = !!follow;
    }

    res.json({ success: true, user, isFollowing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/users/:id (update profile)
const updateUser = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const allowedFields = ['fullName', 'bio', 'department', 'college', 'year', 'skills', 'website', 'github', 'linkedin'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Handle avatar upload
    if (req.file) {
      const user = await User.findById(req.params.id);
      if (user.avatarPublicId) await deleteFromCloudinary(user.avatarPublicId);
      updates.avatar = req.file.path;
      updates.avatarPublicId = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/users/:id/follow
const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id;

    if (targetId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself.' });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ success: false, message: 'User not found.' });

    const existing = await Follow.findOne({ follower: currentUserId, following: targetId });
    if (existing) return res.status(400).json({ success: false, message: 'Already following.' });

    await Follow.create({ follower: currentUserId, following: targetId });

    // Update counts
    const currentUserUpdated = await User.findByIdAndUpdate(
      currentUserId,
      { $inc: { followingCount: 1 } },
      { new: true }
    );
    const targetUserUpdated = await User.findByIdAndUpdate(
      targetId,
      { $inc: { followersCount: 1 } },
      { new: true }
    );

    // Create notification
    await Notification.create({
      recipient: targetId,
      sender: currentUserId,
      type: 'follow',
      referenceModel: 'User',
      referenceId: currentUserId,
      message: `${req.user.fullName} started following you.`,
    });

    res.json({
      success: true,
      message: 'Followed successfully.',
      isFollowing: true,
      targetFollowersCount: targetUserUpdated ? targetUserUpdated.followersCount : 1,
      currentFollowingCount: currentUserUpdated ? currentUserUpdated.followingCount : 1,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/users/:id/follow
const unfollowUser = async (req, res) => {
  try {
    const result = await Follow.findOneAndDelete({ follower: req.user._id, following: req.params.id });
    if (!result) return res.status(400).json({ success: false, message: 'Not following this user.' });

    const currentUserUpdated = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { followingCount: -1 } },
      { new: true }
    );
    const targetUserUpdated = await User.findByIdAndUpdate(
      req.params.id,
      { $inc: { followersCount: -1 } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Unfollowed successfully.',
      isFollowing: false,
      targetFollowersCount: targetUserUpdated ? Math.max(0, targetUserUpdated.followersCount) : 0,
      currentFollowingCount: currentUserUpdated ? Math.max(0, currentUserUpdated.followingCount) : 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/:id/followers
const getFollowers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const follows = await Follow.find({ following: req.params.id })
      .populate('follower', 'username fullName avatar department followersCount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, users: follows.map(f => f.follower) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/:id/following
const getFollowing = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const follows = await Follow.find({ follower: req.params.id })
      .populate('following', 'username fullName avatar department followersCount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, users: follows.map(f => f.following) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/:id/posts
const getUserPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = await User.findOne({ $or: [{ _id: req.params.id }, { username: req.params.id }] });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const posts = await Post.find({ author: user._id, isDeleted: false })
      .populate('author', 'username fullName avatar')
      .populate('tags', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Post.countDocuments({ author: user._id, isDeleted: false });

    res.json({ success: true, posts, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/:id/projects
const getUserProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = await User.findOne({ $or: [{ _id: req.params.id }, { username: req.params.id }] });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const projects = await Project.find({ author: user._id, isDeleted: false })
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Project.countDocuments({ author: user._id, isDeleted: false });

    res.json({ success: true, projects, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, getUserById, updateUser, followUser, unfollowUser, getFollowers, getFollowing, getUserPosts, getUserProjects };
