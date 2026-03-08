// ── Auth ──────────────────────────────────────────────────────────────────────
export type UserRole = 'male' | 'female' | 'admin';
export type MaritalStatus = 'single' | 'divorced' | 'widowed';
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
  pendingWalis: number;
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
