const AIProfile = require('../models/AIProfile');
const AiLog = require('../models/AiLog');
const { queryAI, extractProfileUpdate, cleanResponse } = require('../services/aiService');
const { AI_QUESTIONS } = require('../config/questionnaire');

exports.chat = async (req, res) => {
  const { prompt } = req.body;
  const userId = req.user._id;

  // Récupérer ou créer le profil IA
  let profile = await AIProfile.findOne({ userId });
  if (!profile) {
    profile = new AIProfile({ userId });
  }

  // Construire l'historique complet envoyé à l'IA
  const history = (profile.conversationHistory || []).slice(-16).map((m) => ({
    role: m.role,
    content: m.content,
  }));
  history.push({ role: 'user', content: prompt });

  // Appel IA
  const rawResponse = await queryAI(history, req.user.role === 'female' ? 'female' : 'male');

  // Séparer la réponse affichée et les données de profil
  const userFacingResponse = cleanResponse(rawResponse);
  const profileUpdate = extractProfileUpdate(rawResponse);

  // Log de la conversation IA 
  await AiLog.create({ userId, prompt, response: userFacingResponse });

  // Mettre à jour l'historique de conversation
  profile.conversationHistory.push(
    { role: 'user', content: prompt },
    { role: 'assistant', content: userFacingResponse }
  );
  // Conserver au maximum 30 échanges (60 messages)
  if (profile.conversationHistory.length > 60) {
    profile.conversationHistory = profile.conversationHistory.slice(-60);
  }

  // Mettre à jour le profil IA si l'IA a fourni des données structurées
  if (profileUpdate) {
    if (profileUpdate.religionScore != null)   profile.religionScore   = profileUpdate.religionScore;
    if (profileUpdate.psychologyScore != null) profile.psychologyScore = profileUpdate.psychologyScore;
    if (profileUpdate.lifestyleScore != null)  profile.lifestyleScore  = profileUpdate.lifestyleScore;
    if (Array.isArray(profileUpdate.personalityTraits) && profileUpdate.personalityTraits.length) {
      profile.personalityTraits = profileUpdate.personalityTraits;
    }
    if (profileUpdate.marriageVision) profile.marriageVision = profileUpdate.marriageVision;
    if (profileUpdate.lifestyle)      profile.lifestyle      = profileUpdate.lifestyle;

    // Caractéristiques physiques 
    if (profileUpdate.physicalCharacteristics) {
      const pc = profileUpdate.physicalCharacteristics;
      if (!profile.physicalCharacteristics) profile.physicalCharacteristics = {};
      if (pc.height  != null) profile.physicalCharacteristics.height   = pc.height;
      if (pc.bodyType)        profile.physicalCharacteristics.bodyType  = pc.bodyType;
      if (pc.skinColor)       profile.physicalCharacteristics.skinColor = pc.skinColor;
      if (pc.beard   != null) profile.physicalCharacteristics.beard     = pc.beard;
      if (pc.hijab   != null) profile.physicalCharacteristics.hijab     = pc.hijab;
      if (pc.niqab   != null) profile.physicalCharacteristics.niqab     = pc.niqab;
    }

    // Phase courante et fin de la phase IA 
    if (profileUpdate.currentPhase != null) profile.currentPhase = profileUpdate.currentPhase;

    // Marquer la phase IA comme terminée si l'IA signale phaseCompleted:true
    if (profileUpdate.phaseCompleted === true && !req.user.aiPhaseCompleted) {
      req.user.aiPhaseCompleted = true;
      await req.user.save();
    }
  }

  profile.lastAnalysis = userFacingResponse;
  await profile.save();

  res.json({
    response: userFacingResponse,
    aiPhaseCompleted: req.user.aiPhaseCompleted,
    currentPhase: profile.currentPhase || 1,
  });
};

// Retourner le profil IA actuel de l'utilisateur connecté
exports.getMyProfile = async (req, res) => {
  const profile = await AIProfile.findOne({ userId: req.user._id });
  if (!profile) return res.json(null);
  // Ne pas exposer l'historique brut
  const { conversationHistory, ...safe } = profile.toObject();
  res.json(safe);
};

exports.getAiQuestionnaire = async (req, res) => {
  const role = req.user.role === 'female' ? 'female' : 'male';
  res.json({ role, categories: AI_QUESTIONS[role] });
};