const Post = require('../models/Post');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { deleteFromCloudinary } = require('../middleware/upload');

// Helper to check if current user liked a post
const enrichPostsWithLikes = async (posts, userId) => {
  if (!userId || !posts.length) return posts;
  const postIds = posts.map(p => p._id);
  const likes = await Like.find({ user: userId, targetId: { $in: postIds }, targetType: 'Post' });
  const likedSet = new Set(likes.map(l => l.targetId.toString()));
  return posts.map(p => ({
    ...p.toObject(),
    isLiked: likedSet.has(p._id.toString()),
  }));
};

// GET /api/posts/feed
const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let posts;
    if (req.user) {
      // Get IDs of people the current user follows
      const follows = await Follow.find({ follower: req.user._id }).select('following');
      const followingIds = follows.map(f => f.following);
      followingIds.push(req.user._id); // include own posts

      posts = await Post.find({ author: { $in: followingIds }, isDeleted: false })
        .populate('author', 'username fullName avatar department')
        .populate('tags', 'username fullName avatar')
        .populate('community', 'name slug avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
    } else {
      posts = await Post.find({ isDeleted: false })
        .populate('author', 'username fullName avatar department')
        .populate('tags', 'username fullName avatar')
        .populate('community', 'name slug avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
    }

    const enriched = await enrichPostsWithLikes(posts, req.user?._id);
    const total = posts.length;

    res.json({ success: true, posts: enriched, pagination: { page: Number(page), limit: Number(limit), hasMore: enriched.length === Number(limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/posts/trending
const getTrendingPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const posts = await Post.find({ isDeleted: false, createdAt: { $gte: twentyFourHoursAgo } })
      .populate('author', 'username fullName avatar department')
      .populate('tags', 'username fullName avatar')
      .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // If not enough recent posts, include older ones
    let allPosts = posts;
    if (posts.length < 5) {
      const morePosts = await Post.find({ isDeleted: false })
        .populate('author', 'username fullName avatar department')
        .sort({ likesCount: -1, commentsCount: -1 })
        .limit(Number(limit));
      allPosts = morePosts;
    }

    const enriched = await enrichPostsWithLikes(allPosts, req.user?._id);
    res.json({ success: true, posts: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/posts/:id
const getPost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
      .populate('author', 'username fullName avatar department')
      .populate('tags', 'username fullName avatar')
      .populate('community', 'name slug avatar');

    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    let isLiked = false;
    if (req.user) {
      const like = await Like.findOne({ user: req.user._id, targetId: post._id, targetType: 'Post' });
      isLiked = !!like;
    }

    res.json({ success: true, post: { ...post.toObject(), isLiked } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/posts
const createPost = async (req, res) => {
  try {
    const { content, community, tags } = req.body;

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ success: false, message: 'Post must have content or media.' });
    }

    const media = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const isVideo = file.mimetype.startsWith('video/');
        media.push({ url: file.path, publicId: file.filename, type: isVideo ? 'video' : 'image' });
      }
    }

    // Parse tags (comma-separated usernames or user IDs)
    let tagIds = [];
    if (tags) {
      const tagList = Array.isArray(tags) ? tags : [tags];
      const taggedUsers = await User.find({ _id: { $in: tagList } }).select('_id');
      tagIds = taggedUsers.map(u => u._id);
    }

    const post = await Post.create({
      author: req.user._id,
      content: content || '',
      media,
      community: community || null,
      tags: tagIds,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

    // Notify tagged users
    for (const tagId of tagIds) {
      if (tagId.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: tagId,
          sender: req.user._id,
          type: 'tag',
          referenceModel: 'Post',
          referenceId: post._id,
          message: `${req.user.fullName} tagged you in a post.`,
        });
      }
    }

    const populated = await Post.findById(post._id)
      .populate('author', 'username fullName avatar department')
      .populate('tags', 'username fullName avatar')
      .populate('community', 'name slug');

    res.status(201).json({ success: true, post: populated });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/posts/:id
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const { content } = req.body;
    if (content !== undefined) post.content = content;
    await post.save();

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) return res.status(404).json({ success: false, message: 'Post not found.' });

    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    // Soft delete
    post.isDeleted = true;
    await post.save();

    // Delete media from Cloudinary
    for (const m of post.media) {
      if (m.publicId) await deleteFromCloudinary(m.publicId, m.type === 'video' ? 'video' : 'image');
    }

    if (isAuthor) await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } });

    res.json({ success: true, message: 'Post deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/posts/:id/like
const likePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const existing = await Like.findOne({ user: req.user._id, targetId: post._id, targetType: 'Post' });
    if (existing) return res.status(400).json({ success: false, message: 'Already liked.' });

    await Like.create({ user: req.user._id, targetId: post._id, targetType: 'Post' });
    await Post.findByIdAndUpdate(post._id, { $inc: { likesCount: 1 } });

    // Notify post author (not self)
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'like_post',
        referenceModel: 'Post',
        referenceId: post._id,
        message: `${req.user.fullName} liked your post.`,
      });
    }

    res.json({ success: true, likesCount: post.likesCount + 1, isLiked: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/posts/:id/like
const unlikePost = async (req, res) => {
  try {
    const result = await Like.findOneAndDelete({ user: req.user._id, targetId: req.params.id, targetType: 'Post' });
    if (!result) return res.status(400).json({ success: false, message: 'Not liked.' });

    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { likesCount: -1 } }, { new: true });
    res.json({ success: true, likesCount: Math.max(0, post.likesCount), isLiked: false });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getFeed, getTrendingPosts, getPost, createPost, updatePost, deletePost, likePost, unlikePost };
