const User = require('../models/User');
const AIProfile = require('../models/AIProfile');
const Match = require('../models/Match');
const Wali = require('../models/Wali');
const AiLog = require('../models/AiLog');
const Subscription = require('../models/Subscription');
const jwt = require('jsonwebtoken');
const { REGISTRATION_QUESTIONNAIRE } = require('../config/questionnaire');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  // validation handled by middleware
  const {
    email,
    password,
    role,
    age,
    firstName,
    country,
    city,
    maritalStatus,
    dateOfBirth,
    nationality,
    origin,
    ethnicity,
    hadPreviousMarriage,
    children,
    religiousPractice,
    prayers,
    religiousFollowing,
    madhhab,
    wantsChildren,
    willingToRelocate,
    hijra,
    hijraCountry,
    femaleProfile,
    maleProfile,
    searchCriteria,
    hasAcceptedCharter,
  } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email déjà utilisé.' });

  const user = await User.create({
    email,
    password,
    role,
    age,
    firstName,
    country,
    city,
    maritalStatus,
    dateOfBirth,
    nationality,
    origin,
    ethnicity,
    hadPreviousMarriage,
    children,
    religiousPractice,
    prayers,
    religiousFollowing,
    madhhab: madhhab === 'none' ? 'other' : madhhab,
    wantsChildren,
    willingToRelocate,
    hijra,
    hijraCountry,
    femaleProfile,
    maleProfile,
    searchCriteria,
    hasAcceptedCharter: Boolean(hasAcceptedCharter),
    profileCompleted: true, // les champs de base sont fournis à l'inscription
  });
  const token = signToken(user._id);
  res.status(201).json({ token, userId: user._id, role: user.role });
};

exports.getRegistrationQuestionnaire = async (_req, res) => {
  res.json(REGISTRATION_QUESTIONNAIRE);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (user.banned) {
    return res.status(403).json({ message: 'Account suspended' });
  }
  const token = signToken(user._id);
  res.json({ token, role: user.role, userId: user._id });
};

exports.acceptCharter = async (req, res) => {
  req.user.hasAcceptedCharter = true;
  await req.user.save();
  res.json({ message: 'Charter accepted' });
};

// RGPD — supprime toutes les données liées à l'utilisateur
exports.deleteAccount = async (req, res) => {
  const userId = req.user._id;
  await Promise.all([
    AIProfile.deleteMany({ userId }),
    Match.deleteMany({ $or: [{ user1: userId }, { user2: userId }] }),
    Wali.deleteMany({ femaleUserId: userId }),
    AiLog.deleteMany({ userId }),
    Subscription.deleteMany({ userId }),
    User.findByIdAndDelete(userId),
  ]);
  res.json({ message: 'Account and all associated data deleted' });
};