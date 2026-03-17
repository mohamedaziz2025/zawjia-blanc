/**
 * Compatibility scoring engine — Zawjia
 *
 * Weighted breakdown (must sum to 100):
 *   Religion          40 %
 *   Psychology        25 %
 *   Marriage vision   15 %
 *   Lifestyle         10 %
 *   Location           5 %
 *   Physical           5 %
 */

const WEIGHTS = {
  religion: 0.40,
  psychology: 0.25,
  marriageVision: 0.15,
  lifestyle: 0.10,
  location: 0.05,
  physical: 0.05,
};

/**
 * Normalise a raw 0-100 score to 0-1.
 */
const norm = (v) => (v != null ? Math.min(100, Math.max(0, v)) / 100 : 0.5);

/**
 * Returns 1 if both values match, 0 otherwise. Handles undefined gracefully.
 */
const match = (a, b) => (a != null && b != null && a === b ? 1 : 0);

/**
 * Religion sub-score (0–1)
 * Compares practice level, prayers, religious following and madhhab.
 */
function religionSubscore(u1, p1, u2, p2) {
  let score = 0;
  let factors = 0;

  // scores IA direct
  if (p1?.religionScore != null && p2?.religionScore != null) {
    const diff = Math.abs(p1.religionScore - p2.religionScore) / 100;
    score += 1 - diff;
    factors++;
  }

  // niveaux de pratique
  if (u1.religiousPractice && u2.religiousPractice) {
    score += match(u1.religiousPractice, u2.religiousPractice);
    factors++;
  }

  // prières
  if (u1.prayers && u2.prayers) {
    score += match(u1.prayers, u2.prayers);
    factors++;
  }

  // suivi religieux
  if (u1.religiousFollowing && u2.religiousFollowing) {
    score += match(u1.religiousFollowing, u2.religiousFollowing);
    factors++;
  }

  // madhhab (bonus, pas éliminatoire)
  if (u1.madhhab && u2.madhhab) {
    score += match(u1.madhhab, u2.madhhab) * 0.5;
    factors += 0.5;
  }

  return factors > 0 ? score / factors : 0.5;
}

/**
 * Psychology sub-score (0–1)
 * Compares conflict style, financial attitude and psychology IA score.
 */
function psychologySubscore(p1, p2) {
  let score = 0;
  let factors = 0;

  if (p1?.psychologyScore != null && p2?.psychologyScore != null) {
    const diff = Math.abs(p1.psychologyScore - p2.psychologyScore) / 100;
    score += 1 - diff;
    factors++;
  }

  if (p1?.conflictStyle && p2?.conflictStyle) {
    score += match(p1.conflictStyle, p2.conflictStyle);
    factors++;
  }

  if (p1?.financialAttitude && p2?.financialAttitude) {
    score += match(p1.financialAttitude, p2.financialAttitude);
    factors++;
  }

  return factors > 0 ? score / factors : 0.5;
}

/**
 * Marriage vision sub-score (0–1)
 * Compares role preference, family orientation and children preferences.
 */
function marriageVisionSubscore(u1, p1, u2, p2) {
  let score = 0;
  let factors = 0;

  // veux des enfants
  if (u1.wantsChildren && u2.wantsChildren) {
    score += match(u1.wantsChildren, u2.wantsChildren);
    factors++;
  }

  // préférence de rôles
  if (p1?.rolePreference && p2?.rolePreference) {
    score += match(p1.rolePreference, p2.rolePreference);
    factors++;
  }

  // orientation famille
  if (p1?.familyOrientation && p2?.familyOrientation) {
    score += match(p1.familyOrientation, p2.familyOrientation);
    factors++;
  }

  // accepte les enfants d'une précédente union
  const u1HasKids = u1.children?.has;
  const u2AcceptsKids = p2?.preferences?.acceptChildrenFromPrevious;
  if (u1HasKids != null && u2AcceptsKids != null) {
    if (!u1HasKids || u2AcceptsKids) { score += 1; } else { score += 0; }
    factors++;
  }

  return factors > 0 ? score / factors : 0.5;
}

/**
 * Lifestyle sub-score (0–1)
 * Compares lifestyle IA scores.
 */
function lifestyleSubscore(p1, p2) {
  if (p1?.lifestyleScore != null && p2?.lifestyleScore != null) {
    const diff = Math.abs(p1.lifestyleScore - p2.lifestyleScore) / 100;
    return 1 - diff;
  }
  return 0.5;
}

/**
 * Location sub-score (0–1)
 * Exact city match → 1, same country → 0.6, willing to relocate → 0.4.
 */
function locationSubscore(u1, u2) {
  if (u1.city && u2.city && u1.city.toLowerCase() === u2.city.toLowerCase()) return 1;
  if (u1.country && u2.country && u1.country.toLowerCase() === u2.country.toLowerCase()) return 0.6;
  if (u1.willingToRelocate || u2.willingToRelocate) return 0.4;
  return 0.1;
}

/**
 * Physical sub-score (0–1).
 * Based on declared preferences from one side vs characteristics of the other.
 */
function physicalSubscore(p1, p2) {
  // minimal — can be expanded with more explicit preference fields
  let score = 0;
  let factors = 0;

  const r1 = p1?.preferences?.preferredAgeRange;
  const r2 = p2?.preferences?.preferredAgeRange;

  if (r1 && p2?.userId) {
    // This is a proxy — detailed age comparison is done in the caller
    score += 0.5;
    factors++;
  }
  if (r2 && p1?.userId) {
    score += 0.5;
    factors++;
  }

  return factors > 0 ? score / factors : 0.5;
}

function sideCriteriaSubscore(seeker, candidate) {
  const c = seeker?.searchCriteria;
  if (!c) return 0.5;

  let score = 0;
  let factors = 0;

  if (c.ageMin != null && candidate?.age != null) {
    score += candidate.age >= c.ageMin ? 1 : 0;
    factors++;
  }
  if (c.ageMax != null && candidate?.age != null) {
    score += candidate.age <= c.ageMax ? 1 : 0;
    factors++;
  }
  if (Array.isArray(c.acceptedMaritalStatuses) && c.acceptedMaritalStatuses.length && candidate?.maritalStatus) {
    score += c.acceptedMaritalStatuses.includes('any') || c.acceptedMaritalStatuses.includes(candidate.maritalStatus) ? 1 : 0;
    factors++;
  }
  if (c.desiredReligiousPractice && candidate?.religiousPractice) {
    score += c.desiredReligiousPractice === 'any' || c.desiredReligiousPractice === candidate.religiousPractice ? 1 : 0;
    factors++;
  }
  if (c.prayersExpectation && candidate?.prayers) {
    const ok = c.prayersExpectation === 'any'
      || (c.prayersExpectation === 'regular_required' && candidate.prayers === 'regular')
      || (c.prayersExpectation === 'progress_accepted' && ['regular', 'irregular'].includes(candidate.prayers));
    score += ok ? 1 : 0;
    factors++;
  }
  if (c.relocationRequirement && candidate?.willingToRelocate != null) {
    const ok = c.relocationRequirement === 'any'
      || c.relocationRequirement === 'flexible'
      || c.relocationRequirement === 'not_required'
      || c.relocationRequirement === 'no'
      || c.relocationRequirement === 'required'
      || (c.relocationRequirement === 'yes' && candidate.willingToRelocate);
    score += ok ? 1 : 0;
    factors++;
  }

  return factors > 0 ? score / factors : 0.5;
}

/**
 * Main entry point.
 * @param {Object} user1    - User document (male)
 * @param {Object} profile1 - AIProfile document for user1 (may be null)
 * @param {Object} user2    - User document (female)
 * @param {Object} profile2 - AIProfile document for user2 (may be null)
 * @returns {number} compatibility score between 0 and 100
 */
function computeCompatibility(user1, profile1, user2, profile2) {
  const p1 = profile1 || {};
  const p2 = profile2 || {};

  const scores = {
    religion: religionSubscore(user1, p1, user2, p2),
    psychology: psychologySubscore(p1, p2),
    marriageVision: marriageVisionSubscore(user1, p1, user2, p2),
    lifestyle: lifestyleSubscore(p1, p2),
    location: locationSubscore(user1, user2),
    physical: physicalSubscore(p1, p2),
  };

  const criteriaScore = (sideCriteriaSubscore(user1, user2) + sideCriteriaSubscore(user2, user1)) / 2;

  const total = Object.keys(WEIGHTS).reduce(
    (sum, key) => sum + WEIGHTS[key] * scores[key],
    0
  );

  const blended = total * 0.8 + criteriaScore * 0.2;
  return Math.round(blended * 100); // 0–100
}

module.exports = { computeCompatibility };