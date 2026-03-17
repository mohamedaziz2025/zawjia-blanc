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
  hijra: {
    type: String,
    enum: ['already_done', 'possible_with_country', 'not_desired'],
  },
  hijraCountry: String,

  femaleProfile: {
    veil: { type: String, enum: ['hijab', 'niqab', 'none'] },
    acceptPolygamy: { type: String, enum: ['yes', 'no', 'conditional'] },
    wantsToWork: { type: String, enum: ['yes', 'no', 'flexible'] },
  },

  maleProfile: {
    professionalSituation: { type: String, enum: ['student', 'employee', 'entrepreneur', 'other'] },
    financialStability: { type: String, enum: ['stable', 'building'] },
    polygamyStatus: { type: String, enum: ['no', 'possible', 'already_married'] },
  },

  // ── Critères recherchés (parties 4 & 5) ─────────────────────────────────────
  searchCriteria: {
    ageMin: Number,
    ageMax: Number,
    acceptedMaritalStatuses: [{ type: String, enum: ['single', 'divorced', 'widowed', 'any'] }],
    acceptPreviouslyMarried: { type: String, enum: ['yes', 'no', 'any'] },
    acceptWithChildren: { type: String, enum: ['yes', 'no', 'limited', 'conditional', 'any'] },
    childrenLimit: Number,
    preferredNationalities: [String],
    preferredOrigins: [String],
    preferredEthnicities: [{ type: String, enum: ['arab', 'african', 'turkish', 'caucasian', 'asian', 'indian', 'latin', 'any'] }],
    desiredResidence: { type: String, enum: ['same_country', 'europe_only', 'worldwide', 'any'] },
    desiredReligiousPractice: { type: String, enum: ['little', 'practicing', 'very_practicing', 'any'] },
    prayersExpectation: { type: String, enum: ['regular_required', 'progress_accepted', 'any'] },
    madhhabPreferenceType: { type: String, enum: ['same', 'any', 'specific'] },
    madhhabSpecific: String,
    desiredReligiousFollowing: { type: String, enum: ['student', 'self_taught', 'serious_self_taught', 'any'] },
    hijraVision: { type: String, enum: ['must_hijra', 'open_hijra', 'not_desired', 'any'] },
    heightMin: Number,
    heightMax: Number,
    preferredBodyType: { type: String, enum: ['slim', 'average', 'strong', 'any'] },
    femaleHijabPreference: { type: String, enum: ['required', 'niqab_only', 'hijab_ok', 'any'] },
    maleBeardPreference: { type: String, enum: ['required', 'preferred', 'any'] },
    desiredWorkPreference: { type: String, enum: ['yes', 'no', 'flexible', 'any'] },
    maleProfessionalMinimum: { type: String, enum: ['student_ok', 'employee_min', 'entrepreneur', 'any'] },
    maleFinancialStabilityRequirement: { type: String, enum: ['required', 'building_ok', 'any'] },
    maleAmbition: { type: String, enum: ['very_ambitious', 'stable', 'any'] },
    polygamyPreference: { type: String, enum: ['yes', 'no', 'conditional', 'future_possible', 'monogamy_only', 'any'] },
    acceptAlreadyMarried: { type: String, enum: ['yes', 'no', 'any'] },
    wantsChildrenPreference: { type: String, enum: ['yes', 'no', 'undecided', 'any'] },
    desiredChildrenCount: Number,
    relocationRequirement: { type: String, enum: ['required', 'flexible', 'not_required', 'no', 'yes', 'any'] },
  },

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