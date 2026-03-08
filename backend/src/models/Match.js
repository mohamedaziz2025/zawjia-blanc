const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user1Choice: { type: Boolean, default: false },
  user2Choice: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'matched', 'rejected'], default: 'pending' },
  photoUnlocked: { type: Boolean, default: false },
  finalAcceptedByMale: { type: Boolean, default: false },
  finalAcceptedByFemale: { type: Boolean, default: false },
  photoPath: String,
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);