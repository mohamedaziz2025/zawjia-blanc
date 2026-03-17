// ── Auth ──────────────────────────────────────────────────────────────────────
export type UserRole = 'male' | 'female' | 'admin';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type ReligiousPractice = 'little' | 'practicing' | 'very_practicing';
export type SubscriptionStatus = 'free' | 'active' | 'expired';

export interface AuthResponse {
  token: string;
  userId: string;
  role: UserRole;
}

// ── User ──────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  role: UserRole;
  email: string;
  firstName?: string;
  kunya?: string;
  age?: number;
  nationality?: string;
  origin?: string;
  ethnicity?: string;
  country?: string;
  city?: string;
  maritalStatus?: MaritalStatus;
  hadPreviousMarriage?: boolean;
  children?: { has: boolean; count: number };
  religiousPractice?: ReligiousPractice;
  prayers?: 'regular' | 'irregular' | 'rarely';
  religiousFollowing?: 'none' | 'self_taught' | 'student';
  madhhab?: 'hanafi' | 'maliki' | 'shafii' | 'hanbali' | 'other';
  wantsChildren?: 'yes' | 'no' | 'undecided';
  willingToRelocate?: boolean;
  hijra?: 'already_done' | 'possible_with_country' | 'not_desired';
  hijraCountry?: string;
  femaleProfile?: {
    veil?: 'hijab' | 'niqab' | 'none';
    acceptPolygamy?: 'yes' | 'no' | 'conditional';
    wantsToWork?: 'yes' | 'no' | 'flexible';
  };
  maleProfile?: {
    professionalSituation?: 'student' | 'employee' | 'entrepreneur' | 'other';
    financialStability?: 'stable' | 'building';
    polygamyStatus?: 'no' | 'possible' | 'already_married';
  };
  searchCriteria?: {
    ageMin?: number;
    ageMax?: number;
    acceptedMaritalStatuses?: Array<'single' | 'married' | 'divorced' | 'widowed' | 'any'>;
    acceptWithChildren?: 'yes' | 'no' | 'limited' | 'conditional' | 'any';
    childrenLimit?: number;
    preferredNationalities?: string[];
    preferredOrigins?: string[];
    preferredEthnicities?: Array<'arab' | 'african' | 'turkish' | 'caucasian' | 'asian' | 'indian' | 'latin' | 'any'>;
    desiredResidence?: 'same_country' | 'europe_only' | 'worldwide' | 'any';
    desiredReligiousPractice?: 'little' | 'practicing' | 'very_practicing' | 'any';
    prayersExpectation?: 'regular_required' | 'progress_accepted' | 'any';
    madhhabPreferenceType?: 'same' | 'any' | 'specific';
    madhhabSpecific?: string;
    desiredReligiousFollowing?: 'student' | 'self_taught' | 'serious_self_taught' | 'any';
    hijraVision?: 'must_hijra' | 'open_hijra' | 'not_desired' | 'any';
    heightMin?: number;
    heightMax?: number;
    preferredBodyType?: 'slim' | 'average' | 'strong' | 'any';
    femaleHijabPreference?: 'required' | 'niqab_only' | 'hijab_ok' | 'any';
    maleBeardPreference?: 'required' | 'preferred' | 'any';
    desiredWorkPreference?: 'yes' | 'no' | 'flexible' | 'any';
    maleProfessionalMinimum?: 'student_ok' | 'employee_min' | 'entrepreneur' | 'any';
    maleFinancialStabilityRequirement?: 'required' | 'building_ok' | 'any';
    maleAmbition?: 'very_ambitious' | 'stable' | 'any';
    polygamyPreference?: 'yes' | 'no' | 'conditional' | 'future_possible' | 'monogamy_only' | 'any';
    acceptAlreadyMarried?: 'yes' | 'no' | 'any';
    wantsChildrenPreference?: 'yes' | 'no' | 'undecided' | 'any';
    desiredChildrenCount?: number;
    relocationRequirement?: 'required' | 'flexible' | 'not_required' | 'yes' | 'no' | 'any';
  };
  isVerified: boolean;
  hasAcceptedCharter: boolean;
  aiRequestsUsed: number;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndDate?: string;
  profileCompleted: boolean;
  aiPhaseCompleted: boolean;
  matchingUnlocked: boolean;
  banned: boolean;
  createdAt: string;
}

// ── AIProfile ─────────────────────────────────────────────────────────────────
export interface AIProfile {
  userId: string;
  religionScore?: number;
  psychologyScore?: number;
  lifestyleScore?: number;
  personalityTraits?: string[];
  marriageVision?: string;
  lifestyle?: string;
  psychologyProfile?: string;
  conflictStyle?: 'avoidant' | 'assertive' | 'mediator' | 'direct';
  financialAttitude?: 'saver' | 'spender' | 'debt_averse' | 'entrepreneurial';
  rolePreference?: 'traditional' | 'egalitarian' | 'flexible';
  familyOrientation?: 'nuclear' | 'extended' | 'balanced';
  physicalCharacteristics?: {
    height?: number;
    bodyType?: string;
    skinColor?: string;
    beard?: boolean;
    hijab?: boolean;
    niqab?: boolean;
  };
  preferences?: {
    preferredAgeRange?: { min: number; max: number };
    preferredCountry?: string;
    preferredCity?: string;
    physicalPreferences?: string;
    acceptRelocate?: boolean;
    acceptChildrenFromPrevious?: boolean;
    preferredReligiousPractice?: ReligiousPractice;
  };
  currentPhase: number;
  lastAnalysis?: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ChatResponse {
  response: string;
  aiPhaseCompleted: boolean;
  currentPhase?: number;
}

export interface AiHistoryResponse {
  messages: ChatMessage[];
}

export interface QuestionnaireField {
  key: string;
  type: string;
  options?: Array<string | boolean>;
}

export interface QuestionnaireSection {
  id: string;
  title: string;
  appliesTo: Array<'male' | 'female'>;
  fields: QuestionnaireField[];
}

export interface RegistrationQuestionnaire {
  version: string;
  sections: QuestionnaireSection[];
}

export interface AiQuestionnaireResponse {
  role: 'male' | 'female';
  categories: Record<string, string[]>;
}

// ── Matching ──────────────────────────────────────────────────────────────────
export interface Proposal {
  userId: string;
  age?: number;
  city?: string;
  country?: string;
  nationalite?: string;
  maritalStatus?: MaritalStatus;
  religiousPractice?: ReligiousPractice;
  wantsChildren?: 'yes' | 'no' | 'undecided';
  willingToRelocate?: boolean;
  mainValues?: string[];
  characterTraits?: string[];
  marriageVision?: string;
  physicalDescription?: {
    height?: number;
    bodyType?: string;
    hijab?: boolean;
    beard?: boolean;
  };
  compatibilityScore: number;
}

export interface Match {
  _id: string;
  user1: string | User;
  user2: string | User;
  user1Choice: boolean;
  user2Choice: boolean;
  status: 'pending' | 'matched' | 'rejected';
  photoUnlocked: boolean;
  finalAcceptedByMale: boolean;
  finalAcceptedByFemale: boolean;
  photoPath?: string;
  createdAt: string;
}

// ── Subscription ──────────────────────────────────────────────────────────────
export interface SubscriptionStatusResponse {
  status: SubscriptionStatus;
  endDate?: string;
  plan?: string;
}

// ── Wali ──────────────────────────────────────────────────────────────────────
export interface Wali {
  _id: string;
  femaleUserId: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  isVerified: boolean;
  createdAt: string;
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  totalMales: number;
  totalFemales: number;
  activeSubscriptions: number;
  totalMatches: number;
  pendingMatches: number;
  totalAiLogs: number;
  aiCompletedUsers: number;
  pendingWalis: number;
  totalWalis: number;
}

export interface AiLog {
  _id: string;
  userId: string | User;
  prompt: string;
  response: string;
  phase?: number;
  tokensUsed?: number;
  model?: string;
  createdAt: string;
}
