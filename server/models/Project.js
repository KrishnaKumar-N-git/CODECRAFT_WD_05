const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 2000 },
  technologies: [{ type: String }],
  category: {
    type: String,
    enum: ['web', 'mobile', 'ai-ml', 'iot', 'blockchain', 'game', 'data-science', 'devops', 'other'],
    default: 'other',
  },
  githubUrl: { type: String, default: '' },
  demoUrl: { type: String, default: '' },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

projectSchema.index({ author: 1, createdAt: -1 });
projectSchema.index({ likesCount: -1 });
projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ category: 1 });

module.exports = mongoose.model('Project', projectSchema);
