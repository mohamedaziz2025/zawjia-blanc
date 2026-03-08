const User = require('../models/User');
const Match = require('../models/Match');
const AIProfile = require('../models/AIProfile');
const { computeCompatibility } = require('../utils/compatibility');

// ── Proposals ──────────────────────────────────────────────────────────────────
const PHASE_COMPLETE_GATE_ERROR = 'Votre analyse avec Nisfi IA n\'est pas encore terminée. Complétez les 8 phases pour accéder au matching.';

exports.getProposals = async (req, res) => {
  const me = req.user;

  // Gate : profil de base complet
  if (!me.profileCompleted) {
    return res.status(403).json({ message: 'Complétez votre profil de base avant d\'accéder au matching.' });
  }

  if (!me.aiPhaseCompleted) {
    return res.status(403).json({ message: PHASE_COMPLETE_GATE_ERROR });
  }
  const oppositeGender = me.role === 'male' ? 'female' : 'male';

  // Exclure : même genre, profil incomplet, abonnement inactif, bannis,
  // et profils déjà matchés/rejetés avec moi
  const existingMatchIds = (
    await Match.find({
      $or: [{ user1: me._id }, { user2: me._id }],
      status: { $in: ['matched', 'rejected'] },
    }).select('user1 user2')
  ).flatMap((m) => [m.user1.toString(), m.user2.toString()])
    .filter((id) => id !== me._id.toString());

  const candidates = await User.find({
    role: oppositeGender,
    profileCompleted: true,
    subscriptionStatus: 'active',
    banned: false,
    _id: { $nin: existingMatchIds },
  });

  if (candidates.length === 0) return res.json([]);

  // Charger les AIProfiles en une seule requête
  const myProfile = await AIProfile.findOne({ userId: me._id });
  const candidateIds = candidates.map((c) => c._id);
  const profiles = await AIProfile.find({ userId: { $in: candidateIds } });
  const profileMap = Object.fromEntries(profiles.map((p) => [p.userId.toString(), p]));

  const scored = candidates
    .map((candidate) => ({
      user: candidate,
      score: computeCompatibility(
        me,
        myProfile,
        candidate,
        profileMap[candidate._id.toString()] || null
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Retourner profils anonymisés (sans photo, sans email)
  const proposals = scored.map(({ user, score }) => {
    const candProfile = profileMap[user._id.toString()];
    return {
      userId: user._id,
      age: user.age,
      city: user.city,
      country: user.country,
      nationalite: user.nationality,
      maritalStatus: user.maritalStatus,
      religiousPractice: user.religiousPractice,
      wantsChildren: user.wantsChildren,
      willingToRelocate: user.willingToRelocate,
      mainValues: candProfile?.personalityTraits?.slice(0, 3) || [],
      characterTraits: candProfile?.personalityTraits || [],
      marriageVision: candProfile?.marriageVision || null,
      physicalDescription: candProfile
        ? {
            height: candProfile.physicalCharacteristics?.height,
            bodyType: candProfile.physicalCharacteristics?.bodyType,
            hijab: candProfile.physicalCharacteristics?.hijab,
            beard: candProfile.physicalCharacteristics?.beard,
          }
        : null,
      compatibilityScore: score,
    };
  });

  res.json(proposals);
};

// ── Choose ─────────────────────────────────────────────────────────────────────
exports.choose = async (req, res) => {
  const { userId, choice } = req.body;
  if (typeof choice !== 'boolean') {
    return res.status(400).json({ message: 'choice must be a boolean' });
  }

  const me = req.user;

  // S'assurer que les profils sont de genres opposés
  const target = await User.findById(userId);
  if (!target) return res.status(404).json({ message: 'User not found' });
  if (target.role === me.role) {
    return res.status(400).json({ message: 'Cannot match with same gender' });
  }

  let match = await Match.findOne({
    $or: [
      { user1: me._id, user2: userId },
      { user1: userId, user2: me._id },
    ],
  });

  if (!match) {
    // Par convention : user1 = male, user2 = female
    const [maleId, femaleId] = me.role === 'male'
      ? [me._id, userId]
      : [userId, me._id];
    match = new Match({ user1: maleId, user2: femaleId });
  }

  if (match.user1.equals(me._id)) {
    match.user1Choice = choice;
  } else {
    match.user2Choice = choice;
  }

  if (match.user1Choice && match.user2Choice) {
    match.status = 'matched';
  } else if (match.user1Choice === false || match.user2Choice === false) {
    match.status = 'rejected';
  }

  await match.save();
  res.json({ message: 'Choice recorded', status: match.status });
};

// ── Final decision ─────────────────────────────────────────────────────────────
exports.finalDecision = async (req, res) => {
  const { matchId, finalChoice } = req.body;
  if (typeof finalChoice !== 'boolean') {
    return res.status(400).json({ message: 'finalChoice must be a boolean' });
  }

  const me = req.user;
  const match = await Match.findById(matchId);
  if (!match) return res.status(404).json({ message: 'Match not found' });
  if (match.status !== 'matched') {
    return res.status(400).json({ message: 'Match is not in matched status' });
  }

  if (me.role === 'male') {
    match.finalAcceptedByMale = finalChoice;
  } else {
    match.finalAcceptedByFemale = finalChoice;
  }

  // Photo déverrouillée seulement si les deux ont validé
  if (match.finalAcceptedByMale && match.finalAcceptedByFemale) {
    match.photoUnlocked = true;
  }

  await match.save();
  res.json({ message: 'Final decision updated', photoUnlocked: match.photoUnlocked });
};
// ── Mes matches ──────────────────────────────────────────────────────────────────
exports.getMyMatches = async (req, res) => {
  const me = req.user;
  const matches = await Match.find({
    $or: [{ user1: me._id }, { user2: me._id }],
  }).sort({ updatedAt: -1 });

  const result = matches.map((m) => ({
    matchId: m._id,
    status: m.status,
    photoUnlocked: m.photoUnlocked,
    finalAcceptedByMale: m.finalAcceptedByMale,
    finalAcceptedByFemale: m.finalAcceptedByFemale,
    myChoice: m.user1.equals(me._id) ? m.user1Choice : m.user2Choice,
    partnerChoice: m.user1.equals(me._id) ? m.user2Choice : m.user1Choice,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }));

  res.json(result);
};
// ── Upload photo ───────────────────────────────────────────────────────────────
exports.uploadPhoto = async (req, res) => {
  const { matchId } = req.body;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const match = await Match.findById(matchId);
  if (!match) return res.status(404).json({ message: 'Match not found' });
  match.photoPath = req.file.path;
  await match.save();
  res.json({ message: 'Photo uploaded' });
};