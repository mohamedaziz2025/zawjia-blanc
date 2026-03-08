const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  plan: { type: String, enum: ['monthly', 'yearly'] },
  status: String,
  startDate: Date,
  endDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);