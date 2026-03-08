const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: String,
  response: String,
}, { timestamps: true });

module.exports = mongoose.model('AiLog', aiLogSchema);