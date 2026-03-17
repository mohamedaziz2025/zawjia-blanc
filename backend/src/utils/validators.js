const Joi = require('joi');

const searchCriteriaSchema = Joi.object({
  ageMin: Joi.number().integer().min(18).max(99).allow(null),
  ageMax: Joi.number().integer().min(18).max(99).allow(null),
  acceptedMaritalStatuses: Joi.array().items(Joi.string().valid('single', 'divorced', 'widowed', 'any')).allow(null),
  acceptPreviouslyMarried: Joi.string().valid('yes', 'no', 'any').allow(null),
  acceptWithChildren: Joi.string().valid('yes', 'no', 'limited', 'conditional', 'any').allow(null),
  childrenLimit: Joi.number().integer().min(0).max(20).allow(null),
  preferredNationalities: Joi.array().items(Joi.string().max(60)).allow(null),
  preferredOrigins: Joi.array().items(Joi.string().max(60)).allow(null),
  preferredEthnicities: Joi.array().items(Joi.string().valid('arab', 'african', 'turkish', 'caucasian', 'asian', 'indian', 'latin', 'any')).allow(null),
  desiredResidence: Joi.string().valid('same_country', 'europe_only', 'worldwide', 'any').allow(null),
  desiredReligiousPractice: Joi.string().valid('little', 'practicing', 'very_practicing', 'any').allow(null),
  prayersExpectation: Joi.string().valid('regular_required', 'progress_accepted', 'any').allow(null),
  madhhabPreferenceType: Joi.string().valid('same', 'any', 'specific').allow(null),
  madhhabSpecific: Joi.string().max(60).allow('', null),
  desiredReligiousFollowing: Joi.string().valid('student', 'self_taught', 'serious_self_taught', 'any').allow(null),
  hijraVision: Joi.string().valid('must_hijra', 'open_hijra', 'not_desired', 'any').allow(null),
  heightMin: Joi.number().integer().min(120).max(230).allow(null),
  heightMax: Joi.number().integer().min(120).max(230).allow(null),
  preferredBodyType: Joi.string().valid('slim', 'average', 'strong', 'any').allow(null),
  femaleHijabPreference: Joi.string().valid('required', 'niqab_only', 'hijab_ok', 'any').allow(null),
  maleBeardPreference: Joi.string().valid('required', 'preferred', 'any').allow(null),
  desiredWorkPreference: Joi.string().valid('yes', 'no', 'flexible', 'any').allow(null),
  maleProfessionalMinimum: Joi.string().valid('student_ok', 'employee_min', 'entrepreneur', 'any').allow(null),
  maleFinancialStabilityRequirement: Joi.string().valid('required', 'building_ok', 'any').allow(null),
  maleAmbition: Joi.string().valid('very_ambitious', 'stable', 'any').allow(null),
  polygamyPreference: Joi.string().valid('yes', 'no', 'conditional', 'future_possible', 'monogamy_only', 'any').allow(null),
  acceptAlreadyMarried: Joi.string().valid('yes', 'no', 'any').allow(null),
  wantsChildrenPreference: Joi.string().valid('yes', 'no', 'undecided', 'any').allow(null),
  desiredChildrenCount: Joi.number().integer().min(0).max(12).allow(null),
  relocationRequirement: Joi.string().valid('required', 'flexible', 'not_required', 'no', 'yes', 'any').allow(null),
}).allow(null);

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
  dateOfBirth: Joi.date().max('now').allow(null),
  nationality: Joi.string().max(60).allow('', null),
  origin: Joi.string().max(60).allow('', null),
  ethnicity: Joi.string()
    .valid('arab', 'african', 'turkish', 'caucasian', 'asian', 'indian', 'latin', 'other')
    .allow(null),
  hadPreviousMarriage: Joi.boolean().allow(null),
  children: Joi.object({
    has: Joi.boolean().required(),
    count: Joi.number().integer().min(0).max(20).required(),
  }).allow(null),
  religiousPractice: Joi.string().valid('little', 'practicing', 'very_practicing').allow(null),
  prayers: Joi.string().valid('regular', 'irregular', 'rarely').allow(null),
  religiousFollowing: Joi.string().valid('none', 'self_taught', 'student').allow(null),
  madhhab: Joi.string().valid('hanafi', 'maliki', 'shafii', 'hanbali', 'other', 'none').allow(null),
  wantsChildren: Joi.string().valid('yes', 'no', 'undecided').allow(null),
  willingToRelocate: Joi.boolean().allow(null),
  hijra: Joi.string().valid('already_done', 'possible_with_country', 'not_desired').allow(null),
  hijraCountry: Joi.string().max(80).allow('', null),
  femaleProfile: Joi.object({
    veil: Joi.string().valid('hijab', 'niqab', 'none').allow(null),
    acceptPolygamy: Joi.string().valid('yes', 'no', 'conditional').allow(null),
    wantsToWork: Joi.string().valid('yes', 'no', 'flexible').allow(null),
  }).allow(null),
  maleProfile: Joi.object({
    professionalSituation: Joi.string().valid('student', 'employee', 'entrepreneur', 'other').allow(null),
    financialStability: Joi.string().valid('stable', 'building').allow(null),
    polygamyStatus: Joi.string().valid('no', 'possible', 'already_married').allow(null),
  }).allow(null),
  searchCriteria: searchCriteriaSchema,
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
  hijra: Joi.string().valid('already_done', 'possible_with_country', 'not_desired').allow(null),
  hijraCountry: Joi.string().max(80).allow('', null),
  femaleProfile: Joi.object({
    veil: Joi.string().valid('hijab', 'niqab', 'none').allow(null),
    acceptPolygamy: Joi.string().valid('yes', 'no', 'conditional').allow(null),
    wantsToWork: Joi.string().valid('yes', 'no', 'flexible').allow(null),
  }).allow(null),
  maleProfile: Joi.object({
    professionalSituation: Joi.string().valid('student', 'employee', 'entrepreneur', 'other').allow(null),
    financialStability: Joi.string().valid('stable', 'building').allow(null),
    polygamyStatus: Joi.string().valid('no', 'possible', 'already_married').allow(null),
  }).allow(null),
  searchCriteria: searchCriteriaSchema,
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