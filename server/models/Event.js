const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 2000 },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true, maxlength: 200 },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', default: null },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  attendeesCount: { type: Number, default: 0 },
  maxAttendees: { type: Number, default: 0 }, // 0 = unlimited
  status: { type: String, enum: ['upcoming', 'ongoing', 'past', 'cancelled'], default: 'upcoming' },
  tags: [{ type: String }],
}, { timestamps: true });

eventSchema.index({ date: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', eventSchema);
