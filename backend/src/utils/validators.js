const Joi = require('joi');

// ── Auth ───────────────────────────────────────────────────────────────────────
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('male', 'female').required(),
  age: Joi.number().integer().min(18).required(),
  firstName: Joi.string().max(60).required(),
  country: Joi.string().max(80).required(),
  city: Joi.string().max(80).required(),
  maritalStatus: Joi.string().valid('single', 'divorced', 'widowed').required(),
  hasAcceptedCharter: Joi.boolean().valid(true).required().messages({
    'any.only': 'Vous devez accepter la charte islamique Nisfi pour vous inscrire.',
    'any.required': 'L\'acceptation de la charte islamique est obligatoire.',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ── Profil utilisateur ─────────────────────────────────────────────────────────
const updateProfileSchema = Joi.object({
  firstName: Joi.string().max(60),
  kunya: Joi.string().max(60).allow('', null),
  dateOfBirth: Joi.date().max('now').allow(null),
  age: Joi.number().integer().min(18).max(99),
  nationality: Joi.string().max(60).allow('', null),
  origin: Joi.string().max(60).allow('', null),
  ethnicity: Joi.string()
    .valid('arab', 'african', 'turkish', 'caucasian', 'asian', 'indian', 'latin', 'other')
    .allow(null),
  country: Joi.string().max(80),
  city: Joi.string().max(80),
  maritalStatus: Joi.string().valid('single', 'divorced', 'widowed').allow(null),
  hadPreviousMarriage: Joi.boolean().allow(null),
  children: Joi.object({
    has: Joi.boolean(),
    count: Joi.number().integer().min(0).max(20),
  }).allow(null),
  religiousPractice: Joi.string()
    .valid('little', 'practicing', 'very_practicing')
    .allow(null),
  prayers: Joi.string().valid('regular', 'irregular', 'rarely').allow(null),
  religiousFollowing: Joi.string().valid('none', 'self_taught', 'student').allow(null),
  madhhab: Joi.string()
    .valid('hanafi', 'maliki', 'shafii', 'hanbali', 'other')
    .allow(null),
  wantsChildren: Joi.string().valid('yes', 'no', 'undecided').allow(null),
  willingToRelocate: Joi.boolean().allow(null),
});

// ── Wali ───────────────────────────────────────────────────────────────────────
const waliSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().min(6).max(30).required(),
  email: Joi.string().email().required(),
  matchId: Joi.string().hex().length(24).allow(null, ''), // ObjectId optionnel
});

// ── IA ─────────────────────────────────────────────────────────────────────────
const aiChatSchema = Joi.object({
  prompt: Joi.string().min(1).max(2000).required(),
});

// ── Abonnement ─────────────────────────────────────────────────────────────────
const subscriptionSchema = Joi.object({
  plan: Joi.string().valid('monthly', 'yearly').required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  waliSchema,
  aiChatSchema,
  subscriptionSchema,
};