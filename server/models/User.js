const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    minlength: 3, maxlength: 30,
    match: [/^[a-z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: { type: String, required: true, minlength: 6, select: false },
  fullName: { type: String, required: true, trim: true, maxlength: 60 },
  avatar: { type: String, default: '' },
  avatarPublicId: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  coverImagePublicId: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 200 },
  department: { type: String, default: '' },
  college: { type: String, default: '' },
  year: { type: String, enum: ['1st', '2nd', '3rd', '4th', 'Alumni', ''], default: '' },
  skills: [{ type: String }],
  website: { type: String, default: '' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  isActive: { type: Boolean, default: true },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  postsCount: { type: Number, default: 0 },
  projectsCount: { type: Number, default: 0 },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.avatarPublicId;
  delete obj.coverImagePublicId;
  return obj;
};

// Indexes
userSchema.index({ username: 'text', fullName: 'text', department: 'text' });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
