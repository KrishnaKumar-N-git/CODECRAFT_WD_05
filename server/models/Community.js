const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '', maxlength: 500 },
  category: {
    type: String,
    enum: ['technology', 'science', 'arts', 'sports', 'business', 'academic', 'events', 'general'],
    default: 'general',
  },
  avatar: { type: String, default: '' },
  avatarPublicId: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  coverImagePublicId: { type: String, default: '' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  membersCount: { type: Number, default: 0 },
  postsCount: { type: Number, default: 0 },
  isPrivate: { type: Boolean, default: false },
  rules: [{ type: String }],
}, { timestamps: true });

communitySchema.index({ name: 'text', description: 'text' });
communitySchema.index({ category: 1 });
communitySchema.index({ membersCount: -1 });

module.exports = mongoose.model('Community', communitySchema);
