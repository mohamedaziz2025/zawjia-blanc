const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  // ── Identity ────────────────────────────────────────────────────────────────
  role: { type: String, enum: ['male', 'female', 'admin'], required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },

  // ── Basic profile ────────────────────────────────────────────────────────────
  firstName: { type: String, trim: true },
  kunya: { type: String, trim: true },            // optional display name
  dateOfBirth: Date,
  age: Number,
  nationality: String,
  origin: String,
  ethnicity: {
    type: String,
    enum: ['arab', 'african', 'turkish', 'caucasian', 'asian', 'indian', 'latin', 'other'],
  },
  country: String,                                // pays de résidence
  city: String,                                   // ville de résidence

  // ── Situation familiale ───────────────────────────────────────────────────────
  maritalStatus: {
    type: String,
    enum: ['single', 'divorced', 'widowed'],
  },
  hadPreviousMarriage: { type: Boolean },
  children: {
    has: { type: Boolean },
    count: { type: Number, default: 0 },
  },

  // ── Religion ─────────────────────────────────────────────────────────────────
  religiousPractice: {
    type: String,
    enum: ['little', 'practicing', 'very_practicing'],
  },
  prayers: {
    type: String,
    enum: ['regular', 'irregular', 'rarely'],
  },
  religiousFollowing: {
    type: String,
    enum: ['none', 'self_taught', 'student'],
  },
  madhhab: {
    type: String,
    enum: ['hanafi', 'maliki', 'shafii', 'hanbali', 'other'],
  },

  // ── Projet de vie ────────────────────────────────────────────────────────────
  wantsChildren: {
    type: String,
    enum: ['yes', 'no', 'undecided'],
  },
  willingToRelocate: { type: Boolean },

  // ── Photo (stockée mais cachée jusqu'au match) ────────────────────────────────
  photoPath: { type: String, select: false },

  // ── Statut plateforme ────────────────────────────────────────────────────────
  isVerified: { type: Boolean, default: false },
  hasAcceptedCharter: { type: Boolean, default: false },
  aiRequestsUsed: { type: Number, default: 0 },
  subscriptionStatus: { type: String, enum: ['free', 'active', 'expired'], default: 'free' },
  subscriptionEndDate: Date,
  profileCompleted: { type: Boolean, default: false },
  aiPhaseCompleted: { type: Boolean, default: false }, // toutes les 8 phases IA terminées
  matchingUnlocked: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);