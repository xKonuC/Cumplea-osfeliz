export type StageKind = 'intro' | 'stop' | 'assembly' | 'homecoming';
export type StageStatus = 'locked' | 'available' | 'in-progress' | 'completed';
export type InteractionKind = 'discovery' | 'word-order' | 'qualities' | 'photo-reveal' | 'fragment-order' | 'homecoming';

export interface FragmentConfig {
  id: string;
  label: string;
  color: string;
  imageUrl?: string;
}

export interface StageInteractionConfig {
  kind: InteractionKind;
  phrase?: string;
  phraseParts?: readonly string[];
  successMessage?: string;
  destinationName?: string;
  arrivalInstruction?: string;
  scenarios?: readonly { text: string; quality: string }[];
  qualities?: readonly string[];
  locationAlt?: string;
  approximateReturnMinutes?: number;
}

export interface RewardConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface StageConfig {
  id: string;
  order: number;
  kind: StageKind;
  title: string;
  subtitle: string;
  description: string;
  primaryHint: string;
  secondaryHint: string;
  tertiaryHint?: string;
  finalHint: string;
  imageUrl?: string;
  mapUrl?: string;
  expectedQrCode: string;
  manualCode: string;
  validationMode?: 'qr-or-code' | 'code-only';
  videoUrl: string;
  videoPosterUrl?: string;
  beforeVideoText: string;
  afterVideoText: string;
  reward: RewardConfig;
  fragment: FragmentConfig;
  mission: string;
  completionMessage: string;
  nextTeaser: string;
  interaction: StageInteractionConfig;
  rewardInstruction: string;
  nextStageName?: string;
  specialInstruction?: string;
  countdownTarget?: string;
  finalLetter?: string;
  finalGiftName?: string;
  finalGiftImageUrl?: string;
}

export interface EpilogueConfig {
  expectedQrCode: string;
  manualCode: string;
  videoUrl: string;
  videoPosterUrl?: string;
  galleryUrls: readonly string[];
  introText: string;
  finalLetter: string;
  finalGiftName: string;
  finalGiftImageUrl?: string;
}

export interface AdventureConfig {
  version: number;
  recipientName: string;
  experienceName: string;
  eventDate: string;
  introText: string;
  introVideoUrl: string;
  introVideoPosterUrl?: string;
  coverImageUrl: string;
  musicUrl: string;
  adminKey: string;
  fragmentMode: 'abstract' | 'heart' | 'photo';
  stages: readonly StageConfig[];
  epilogue: EpilogueConfig;
}

export interface AdventureProgress {
  version: number;
  started: boolean;
  currentStageId: string;
  unlockedStageIds: string[];
  completedStageIds: string[];
  unlockedVideoIds: string[];
  watchedVideoIds: string[];
  unlockedRewardIds: string[];
  confirmedFragmentStageIds: string[];
  hintsUsed: Record<string, number>;
  startedAt?: string;
  completedAt?: string;
  musicEnabled: boolean;
  returningHome: boolean;
  adventureCompleted: boolean;
}
