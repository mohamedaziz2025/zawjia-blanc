const mongoose = require('mongoose');

const waliSchema = new mongoose.Schema({
  femaleUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
  fullName: String,
  phone: String,
  email: String,
  verified: { type: Boolean, default: false },
  transferredToMale: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Wali', waliSchema);