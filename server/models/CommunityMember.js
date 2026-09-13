const mongoose = require('mongoose');

const communityMemberSchema = new mongoose.Schema({
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['member', 'moderator', 'admin'], default: 'member' },
}, { timestamps: { createdAt: 'joinedAt', updatedAt: false } });

communityMemberSchema.index({ community: 1, user: 1 }, { unique: true });
communityMemberSchema.index({ user: 1 });

module.exports = mongoose.model('CommunityMember', communityMemberSchema);
