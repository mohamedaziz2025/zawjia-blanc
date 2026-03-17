/**
 * AI service — supports Google Gemini and OpenAI.
 * Accepts an array of messages so conversation history is preserved.
 */
const axios = require('axios');
const { AI_QUESTIONS } = require('../config/questionnaire');

function buildSystemPrompt(role = 'male') {
  const catalog = AI_QUESTIONS[role] || AI_QUESTIONS.male;
  const categoriesBlock = Object.entries(catalog)
    .map(([category, questions]) => {
      const list = questions.map((q, index) => `${index + 1}. ${q}`).join('\n');
      return `CATEGORIE ${category.toUpperCase()}\n${list}`;
    })
    .join('\n\n');

  return `Tu es Nisfi, un assistant islamique spécialisé dans le mariage (nikah).
Tu parles exclusivement en français. Ton rôle est d'analyser en profondeur la personne qui te parle
pour constituer un profil matrimonial sérieux, conforme aux valeurs coraniques et à la Sunna.

TU NE FLIRTES PAS. Tu ne fais pas de compliments superficiels. Tu poses des questions sobres,
bienveillantes et progressives. Tu détectes les incohérences entre les réponses et tu les relèves
doucement pour approfondir la connaissance de la personne.

SUIVRE CE PARCOURS EN 8 PHASES (dans l'ordre, une phase à la fois) :

PHASE 1 — Religion & intention
  Quelle est ton intention dans cette démarche ?
  Comment vis-tu ta pratique religieuse au quotidien (prières, lecture, etc.) ?
  Comment décris-tu ton niveau de pratique ?
  Suis-tu un madhhab ? Lequel ?

PHASE 2 — Personnalité & psychologie
  Comment les gens qui te connaissent bien te décriraient-ils ?
  Quelles sont tes plus grandes qualités ? Tes axes d'amélioration ?
  Comment réagis-tu face au stress ou à un désaccord ?

PHASE 3 — Vie conjugale
  Quelle vision as-tu du foyer islamique idéal ?
  Quel rôle souhaites-tu tenir au sein du couple ?
  Quelle importance accordes-tu à la consultation (shura) dans le couple ?

PHASE 4 — Communication & émotions
  Comment exprimes-tu tes émotions ?
  Comment gères-tu les conflits au sein d'une relation ?
  Qu'est-ce qui t'est difficile à communiquer ?

PHASE 5 — Mode de vie
  Décris ta journée type.
  Où vis-tu ? Es-tu ouvert(e) à un déménagement ?
  Quels sont tes projets professionnels ?

PHASE 6 — Mises en situation réelles
  Si ton conjoint(e) avait une opinion différente sur un point religieux, comment réagirais-tu ?
  Comment gèrerais-tu une belle-famille intrusive ?
  Que ferais-tu si ton conjoint(e) traversait une épreuve difficile ?

PHASE 7 — Attentes & limites
  Quelles sont tes attentes non-négociables chez un(e) conjoint(e) ?
  Y a-t-il des situations que tu ne pourrais pas accepter ?

PHASE 8 — Enfants & avenir
  Souhaites-tu avoir des enfants ? Combien ?
  Comment envisages-tu l'éducation islamique de tes enfants ?
  Quels sont tes projets de vie à 5-10 ans ?

CARACTÉRISTIQUES PHYSIQUES (à collecter naturellement pendant la conversation)
  Taille (en cm), Morphologie (mince / moyen / corpulent), Couleur de peau (optionnel),
  Couleur et type de cheveux, Port de la barbe (frères) / hijab ou niqab (sœurs),
  Particularités physiques éventuelles.

DÉTECTION D'INCOHÉRENCES
  Surveille attentivement les contradictions entre les réponses.
  Relève-les avec bienveillance : "Tu as mentionné X, mais aussi Y — peux-tu m'en dire plus ?"

APRÈS CHAQUE RÉPONSE, insère discrètement en fin de message :
[PROFILE_UPDATE]{"religionScore":null,"psychologyScore":null,"lifestyleScore":null,"personalityTraits":[],"marriageVision":null,"lifestyle":null,"currentPhase":1,"physicalCharacteristics":{"height":null,"bodyType":null,"skinColor":null,"beard":null,"hijab":null,"niqab":null},"phaseCompleted":false}[/PROFILE_UPDATE]

Mets à jour UNIQUEMENT les champs pour lesquels tu as des informations fiables. Laisse null les inconnues.
Les scores sont de 0 à 100. "phaseCompleted":true uniquement quand toutes les 8 phases sont terminées
ET les caractéristiques physiques collectées. "currentPhase" indique la phase en cours (1 à 8).

QUESTIONNAIRE INTERNE A SUIVRE (adapte la formulation pour garder une conversation naturelle)
${categoriesBlock}`;
}

/**
 * @param {Array<{role: string, content: string}>} messages  Full conversation history
 * @param {'male'|'female'} role
 * @param {number} currentPhase
 * @returns {Promise<string>} AI response text
 */
async function queryAI(messages, role = 'male', currentPhase = 1) {
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();
  const hasGoogleKey = Boolean(process.env.GOOGLE_AI_API_KEY);
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);

  const tryGoogleFirst = provider === 'google' || (!provider && hasGoogleKey);

  try {
    if (tryGoogleFirst && hasGoogleKey) {
      return await queryGoogleAI(messages, role);
    }

    if ((provider === 'openai' || hasOpenAIKey) && hasOpenAIKey) {
      return await queryOpenAI(messages, role);
    }

    if (provider === 'google' && !hasGoogleKey) {
      throw new Error('GOOGLE_AI_API_KEY not configured');
    }
    if (provider === 'openai' && !hasOpenAIKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    throw new Error('No AI provider configured. Set GOOGLE_AI_API_KEY or OPENAI_API_KEY.');
  } catch (primaryError) {
    try {
      if (tryGoogleFirst && hasOpenAIKey) {
        return await queryOpenAI(messages, role);
      }
      if (!tryGoogleFirst && hasGoogleKey) {
        return await queryGoogleAI(messages, role);
      }
    } catch (_secondaryError) {
      // Ignore secondary provider error and continue with local fallback.
    }

    // Last-resort fallback to keep AI chat operational even without external provider.
    return queryLocalFallback(messages, role, currentPhase, primaryError);
  }
}

function queryLocalFallback(messages, role, currentPhase, primaryError) {
  const phaseToCategory = {
    1: 'religion',
    2: 'personality',
    3: 'vision',
    4: 'communication',
    5: 'lifestyle',
    6: 'family',
    7: 'finance_and_projects',
    8: 'parenting',
  };

  const userTurns = messages.filter((m) => m.role === 'user').length;
  const estimatedPhase = Math.max(currentPhase || 1, Math.min(8, Math.ceil(userTurns / 3)));
  const category = phaseToCategory[estimatedPhase] || 'vision';
  const catalog = AI_QUESTIONS[role] || AI_QUESTIONS.male;
  const list = Array.isArray(catalog?.[category]) ? catalog[category] : [];
  const questionIndex = list.length ? (Math.max(userTurns - 1, 0) % list.length) : 0;
  const followUpQuestion = list[questionIndex] || 'Peux-tu me parler davantage de ta vision du mariage ?';

  const profileUpdate = {
    religionScore: null,
    psychologyScore: null,
    lifestyleScore: null,
    personalityTraits: [],
    marriageVision: null,
    lifestyle: null,
    currentPhase: estimatedPhase,
    physicalCharacteristics: {
      height: null,
      bodyType: null,
      skinColor: null,
      beard: null,
      hijab: null,
      niqab: null,
    },
    phaseCompleted: estimatedPhase >= 8 && userTurns >= 24,
  };

  return `BarakAllahu fik pour ta réponse.\n\nPhase ${estimatedPhase}/8 — avançons pas à pas.\n${followUpQuestion}\n\n[PROFILE_UPDATE]${JSON.stringify(profileUpdate)}[/PROFILE_UPDATE]`;
}

async function queryOpenAI(messages, role) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const payload = {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: buildSystemPrompt(role) },
      ...messages,
    ],
    temperature: 0.45,
    max_tokens: 420,
  };

  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    payload,
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );

  return data.choices[0].message.content;
}

async function queryGoogleAI(messages, role) {
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY not configured');
  }

  const model = process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`;
  const systemPrompt = buildSystemPrompt(role);
  const transcript = [
    `SYSTEM:\n${systemPrompt}`,
    ...messages.map((m) => `${m.role.toUpperCase()}:\n${m.content}`),
  ].join('\n\n');

  const payload = {
    contents: [
      {
        parts: [{ text: transcript }],
      },
    ],
    generationConfig: {
      temperature: 0.45,
      maxOutputTokens: 420,
    },
  };

  const { data } = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p?.text)
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Empty response from Google AI');
  }

  return text;
}

/**
 * Extract structured profile update embedded by the AI in its response.
 * Returns null if not found.
 */
function extractProfileUpdate(aiText) {
  const match = aiText.match(/\[PROFILE_UPDATE\](.*?)\[\/PROFILE_UPDATE\]/s);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim());
  } catch {
    return null;
  }
}

/**
 * Strip the [PROFILE_UPDATE] block from the AI response shown to the user.
 */
function cleanResponse(aiText) {
  return aiText.replace(/\[PROFILE_UPDATE\].*?\[\/PROFILE_UPDATE\]/s, '').trim();
}

module.exports = { queryAI, extractProfileUpdate, cleanResponse };