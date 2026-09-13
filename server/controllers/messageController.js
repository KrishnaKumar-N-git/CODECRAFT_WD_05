const Message = require('../models/Message');
const User = require('../models/User');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');

// GET /api/messages/conversations
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all distinct conversation partners
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'username fullName avatar department')
      .populate('recipient', 'username fullName avatar department');

    const conversationMap = new Map();

    messages.forEach((msg) => {
      const isSender = msg.sender._id.toString() === currentUserId.toString();
      const partner = isSender ? msg.recipient : msg.sender;
      const partnerId = partner._id.toString();

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner,
          lastMessage: {
            _id: msg._id,
            content: msg.content,
            sender: msg.sender._id,
            createdAt: msg.createdAt,
            read: msg.read,
          },
          unreadCount: 0,
        });
      }

      if (!isSender && !msg.read) {
        const conv = conversationMap.get(partnerId);
        conv.unreadCount += 1;
      }
    });

    // Also include followers/following who don't have messages yet so students can start conversations with their peers
    const follows = await Follow.find({
      $or: [{ follower: currentUserId }, { following: currentUserId }],
    })
      .populate('follower', 'username fullName avatar department')
      .populate('following', 'username fullName avatar department');

    follows.forEach((f) => {
      const partner = f.follower._id.toString() === currentUserId.toString() ? f.following : f.follower;
      const partnerId = partner._id.toString();
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner,
          lastMessage: null,
          unreadCount: 0,
        });
      }
    });

    const conversations = Array.from(conversationMap.values()).sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/messages/:userId
const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar');

    // Auto mark received messages as read
    await Message.updateMany(
      { sender: targetUserId, recipient: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const currentUserId = req.user._id;

    if (!recipientId || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient and content are required.' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found.' });
    }

    const message = await Message.create({
      sender: currentUserId,
      recipient: recipientId,
      content: content.trim(),
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar');

    // Send notification
    await Notification.create({
      recipient: recipientId,
      sender: currentUserId,
      type: 'mention',
      referenceModel: 'User',
      referenceId: currentUserId,
      message: `${req.user.fullName} sent you a direct message: "${content.slice(0, 40)}..."`,
    });

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/messages/read/:userId
const markAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    await Message.updateMany(
      { sender: targetUserId, recipient: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, message: 'Messages marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
};
