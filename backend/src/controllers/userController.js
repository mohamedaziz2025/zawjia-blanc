const User = require('../models/User');
const AIProfile = require('../models/AIProfile');
const path = require('path');
const fs = require('fs');

// Champs que l'utilisateur peut modifier lui-même
const ALLOWED_PROFILE_FIELDS = [
  'firstName', 'kunya', 'dateOfBirth', 'age',
  'nationality', 'origin', 'ethnicity',
  'country', 'city',
  'maritalStatus', 'hadPreviousMarriage', 'children',
  'religiousPractice', 'prayers', 'religiousFollowing', 'madhhab',
  'wantsChildren', 'willingToRelocate',
  'hijra', 'hijraCountry',
  'femaleProfile', 'maleProfile',
  'searchCriteria',
];

const REQUIRED_FOR_COMPLETION = [
  'firstName', 'age', 'country', 'city',
  'maritalStatus', 'religiousPractice', 'wantsChildren',
];

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -photoPath');
  const aiProfile = await AIProfile.findOne({ userId: req.user._id }).select(
    '-conversationHistory'
  );
  res.json({ user, aiProfile });
};

exports.updateProfile = async (req, res) => {
  // Filtrer uniquement les champs autorisés
  const updates = {};
  ALLOWED_PROFILE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // Calculer si le profil est maintenant complet
  const merged = { ...req.user.toObject(), ...updates };
  updates.profileCompleted = REQUIRED_FOR_COMPLETION.every(
    (f) => merged[f] != null && merged[f] !== ''
  );

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select(
    '-password -photoPath'
  );
  res.json(user);
};


exports.uploadProfilePhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu.' });

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ message: 'Format non autorisé (jpeg, png, webp uniquement).' });
  }

  // Supprimer l'ancienne photo si elle existe
  const existing = await User.findById(req.user._id).select('photoPath');
  if (existing?.photoPath) {
    fs.unlink(path.resolve(existing.photoPath), () => {});
  }

  await User.findByIdAndUpdate(req.user._id, { photoPath: req.file.path });
  res.json({ message: 'Photo enregistrée. Elle sera visible uniquement après un match réciproque.' });
};