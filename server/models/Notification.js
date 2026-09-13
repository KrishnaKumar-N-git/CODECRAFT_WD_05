const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type: {
    type: String,
    enum: ['follow', 'like_post', 'like_comment', 'like_project', 'comment', 'reply', 'tag', 'community_join', 'event_update'],
    required: true,
  },
  referenceModel: { type: String, enum: ['Post', 'Comment', 'Community', 'Project', 'Event', 'User', null], default: null },
  referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
