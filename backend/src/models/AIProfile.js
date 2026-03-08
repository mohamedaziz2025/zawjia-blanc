const mongoose = require('mongoose');

const aiProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // ── Scores IA (0-100 chacun) ──────────────────────────────────────────────
  religionScore: { type: Number, min: 0, max: 100 },
  psychologyScore: { type: Number, min: 0, max: 100 },
  lifestyleScore: { type: Number, min: 0, max: 100 },

  // ── Traits & vision ───────────────────────────────────────────────────────
  personalityTraits: [String],          // ex: ['patient', 'empathique', 'ambitieux']
  marriageVision: String,               // résumé IA de la vision du mariage
  lifestyle: String,                    // description générale du mode de vie
  psychologyProfile: String,            // profil psychologique résumé
  conflictStyle: {
    type: String,
    enum: ['avoidant', 'assertive', 'mediator', 'direct'],
  },
  financialAttitude: {
    type: String,
    enum: ['saver', 'spender', 'debt_averse', 'entrepreneurial'],
  },
  rolePreference: {
    type: String,
    enum: ['traditional', 'egalitarian', 'flexible'],
  },
  familyOrientation: {
    type: String,
    enum: ['nuclear', 'extended', 'balanced'],
  },

  // ── Caractéristiques physiques (déclaratives) ─────────────────────────────
  physicalCharacteristics: {
    height: Number,                     // en cm
    bodyType: String,
    skinColor: String,
    beard: Boolean,                     // frères uniquement
    hijab: Boolean,                     // sœurs uniquement
    niqab: Boolean,
  },

  // ── Préférences pour le conjoint ─────────────────────────────────────────
  preferences: {
    preferredAgeRange: { min: { type: Number }, max: { type: Number } },
    preferredCountry: String,
    preferredCity: String,
    physicalPreferences: String,
    acceptRelocate: Boolean,
    acceptChildrenFromPrevious: Boolean,
    preferredReligiousPractice: {
      type: String,
      enum: ['little', 'practicing', 'very_practicing'],
    },
  },
  // ── Progression des phases IA  ────────────────────────────────
  currentPhase: { type: Number, default: 1, min: 1, max: 8 }, // phase en cours (1-8)
  // ── Stockage brut IA ─────────────────────────────────────────────────────
  lastAnalysis: String,
  conversationHistory: [
    {
      role: { type: String, enum: ['user', 'assistant'] },
      content: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('AIProfile', aiProfileSchema);