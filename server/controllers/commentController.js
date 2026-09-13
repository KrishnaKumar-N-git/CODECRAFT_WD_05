const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Project = require('../models/Project');
const Like = require('../models/Like');
const Notification = require('../models/Notification');

// GET /api/comments?post=&project=&page=&limit=
const getComments = async (req, res) => {
  try {
    const { post, project, page = 1, limit = 20, parent = null } = req.query;
    const query = { isDeleted: false, parent: parent || null };

    if (post) query.post = post;
    else if (project) query.post = null; // handled separately

    const comments = await Comment.find(query)
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Get like status for current user
    let commentsWithLikes = comments.map(c => c.toObject());
    if (req.user && comments.length > 0) {
      const commentIds = comments.map(c => c._id);
      const likes = await Like.find({ user: req.user._id, targetId: { $in: commentIds }, targetType: 'Comment' });
      const likedSet = new Set(likes.map(l => l.targetId.toString()));
      commentsWithLikes = commentsWithLikes.map(c => ({ ...c, isLiked: likedSet.has(c._id.toString()) }));
    }

    res.json({ success: true, comments: commentsWithLikes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/comments
const createComment = async (req, res) => {
  try {
    const { content, post, parent } = req.body;
    if (!content || !post) {
      return res.status(400).json({ success: false, message: 'Content and post are required.' });
    }

    const postDoc = await Post.findOne({ _id: post, isDeleted: false });
    if (!postDoc) return res.status(404).json({ success: false, message: 'Post not found.' });

    const comment = await Comment.create({
      post, author: req.user._id, content, parent: parent || null,
    });

    await Post.findByIdAndUpdate(post, { $inc: { commentsCount: 1 } });

    const populated = await Comment.findById(comment._id)
      .populate('author', 'username fullName avatar');

    // Notify post author
    if (postDoc.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: postDoc.author,
        sender: req.user._id,
        type: 'comment',
        referenceModel: 'Post',
        referenceId: post,
        message: `${req.user.fullName} commented on your post: "${content.slice(0, 60)}..."`,
      });
    }

    // Notify parent comment author (reply)
    if (parent) {
      const parentComment = await Comment.findById(parent);
      if (parentComment && parentComment.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: parentComment.author,
          sender: req.user._id,
          type: 'reply',
          referenceModel: 'Post',
          referenceId: post,
          message: `${req.user.fullName} replied to your comment.`,
        });
      }
    }

    res.status(201).json({ success: true, comment: { ...populated.toObject(), isLiked: false } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/comments/:id
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.isDeleted) return res.status(404).json({ success: false, message: 'Comment not found.' });

    const isAuthor = comment.author.toString() === req.user._id.toString();
    if (!isAuthor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    comment.isDeleted = true;
    await comment.save();

    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

    res.json({ success: true, message: 'Comment deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/comments/:id/like
const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id, isDeleted: false });
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    const existing = await Like.findOne({ user: req.user._id, targetId: comment._id, targetType: 'Comment' });
    if (existing) {
      await Like.findByIdAndDelete(existing._id);
      await Comment.findByIdAndUpdate(comment._id, { $inc: { likesCount: -1 } });
      return res.json({ success: true, isLiked: false });
    }

    await Like.create({ user: req.user._id, targetId: comment._id, targetType: 'Comment' });
    await Comment.findByIdAndUpdate(comment._id, { $inc: { likesCount: 1 } });
    res.json({ success: true, isLiked: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getComments, createComment, deleteComment, likeComment };
