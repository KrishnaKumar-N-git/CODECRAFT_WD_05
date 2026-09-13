const Community = require('../models/Community');
const CommunityMember = require('../models/CommunityMember');
const Post = require('../models/Post');

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// GET /api/communities
const getCommunities = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const communities = await Community.find(query)
      .populate('creator', 'username fullName avatar')
      .sort({ membersCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Attach membership status
    let result = communities.map(c => c.toObject());
    if (req.user) {
      const memberships = await CommunityMember.find({
        community: { $in: communities.map(c => c._id) },
        user: req.user._id,
      });
      const memberSet = new Set(memberships.map(m => m.community.toString()));
      result = result.map(c => ({ ...c, isMember: memberSet.has(c._id.toString()) }));
    }

    const total = await Community.countDocuments(query);
    res.json({ success: true, communities: result, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/communities/:slug
const getCommunity = async (req, res) => {
  try {
    const community = await Community.findOne({ slug: req.params.slug })
      .populate('creator', 'username fullName avatar');
    if (!community) return res.status(404).json({ success: false, message: 'Community not found.' });

    let isMember = false;
    let memberRole = null;
    if (req.user) {
      const membership = await CommunityMember.findOne({ community: community._id, user: req.user._id });
      isMember = !!membership;
      memberRole = membership?.role;
    }

    res.json({ success: true, community, isMember, memberRole });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/communities
const createCommunity = async (req, res) => {
  try {
    const { name, description, category, rules } = req.body;
    let slug = slugify(name);

    // Ensure unique slug
    const existing = await Community.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const community = await Community.create({
      name, slug, description, category, rules: rules || [],
      creator: req.user._id, membersCount: 1,
    });

    // Creator auto-joins as admin
    await CommunityMember.create({ community: community._id, user: req.user._id, role: 'admin' });

    res.status(201).json({ success: true, community });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/communities/:id/join
const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: 'Community not found.' });

    const existing = await CommunityMember.findOne({ community: community._id, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already a member.' });

    await CommunityMember.create({ community: community._id, user: req.user._id });
    await Community.findByIdAndUpdate(community._id, { $inc: { membersCount: 1 } });

    res.json({ success: true, message: 'Joined community.', isMember: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/communities/:id/join
const leaveCommunity = async (req, res) => {
  try {
    const result = await CommunityMember.findOneAndDelete({ community: req.params.id, user: req.user._id });
    if (!result) return res.status(400).json({ success: false, message: 'Not a member.' });

    await Community.findByIdAndUpdate(req.params.id, { $inc: { membersCount: -1 } });
    res.json({ success: true, message: 'Left community.', isMember: false });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/communities/:id/members
const getMembers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const members = await CommunityMember.find({ community: req.params.id })
      .populate('user', 'username fullName avatar department')
      .sort({ joinedAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/communities/:id/posts
const getCommunityPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const posts = await Post.find({ community: req.params.id, isDeleted: false })
      .populate('author', 'username fullName avatar')
      .populate('tags', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCommunities, getCommunity, createCommunity, joinCommunity, leaveCommunity, getMembers, getCommunityPosts };
