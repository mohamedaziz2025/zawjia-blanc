const User = require('../models/User');
const Match = require('../models/Match');
const Subscription = require('../models/Subscription');
const Wali = require('../models/Wali');
const AiLog = require('../models/AiLog');

// ── Dashboard stats ──────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  const [
    totalUsers,
    totalMales,
    totalFemales,
    activeSubscriptions,
    totalMatches,
    pendingMatches,
    pendingWalis,
    totalWalis,
    totalAiLogs,
    aiCompletedUsers,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: 'admin' } }),
    User.countDocuments({ role: 'male' }),
    User.countDocuments({ role: 'female' }),
    Subscription.countDocuments({ status: 'active' }),
    Match.countDocuments(),
    Match.countDocuments({ status: 'pending' }),
    Wali.countDocuments({ verified: false }),
    Wali.countDocuments(),
    AiLog.countDocuments(),
    User.countDocuments({ aiPhaseCompleted: true }),
  ]);
  res.json({
    totalUsers,
    totalMales,
    totalFemales,
    activeSubscriptions,
    totalMatches,
    pendingMatches,
    pendingWalis,
    totalWalis,
    totalAiLogs,
    aiCompletedUsers,
  });
};

// ── Users ────────────────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
  res.json(users);
};

exports.banUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(id, { banned: true }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User banned', userId: user._id });
};

exports.unbanUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(id, { banned: false }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User unbanned', userId: user._id });
};

// ── Matches ──────────────────────────────────────────────────────────────────
exports.getMatches = async (req, res) => {
  const matches = await Match.find()
    .populate('user1', 'email role')
    .populate('user2', 'email role');
  res.json(matches);
};

// ── Subscriptions ────────────────────────────────────────────────────────────
exports.getSubscriptions = async (req, res) => {
  const subs = await Subscription.find().populate('userId', 'email');
  res.json(subs);
};

// ── Walis ────────────────────────────────────────────────────────────────────
exports.getWalis = async (req, res) => {
  const walis = await Wali.find().populate('femaleUserId', 'email firstName');
  res.json(walis);
};

exports.verifyWali = async (req, res) => {
  const { id } = req.params;
  const wali = await Wali.findById(id);
  if (!wali) return res.status(404).json({ message: 'Wali not found' });
  wali.verified = true;
  await wali.save();
  res.json({ message: 'Wali verified', wali });
};

// ── AI Logs ──────────────────────────────────────────────────────────────────
exports.getAiLogs = async (req, res) => {
  const logs = await AiLog.find()
    .populate('userId', 'email')
    .sort({ createdAt: -1 })
    .limit(200);
  res.json(logs);
};