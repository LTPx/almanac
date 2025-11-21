export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null | undefined;
  isPremium?: boolean;
}

export interface Question {
  id: number;
  type:
    | "MULTIPLE_CHOICE"
    | "FILL_IN_BLANK"
    | "ORDER_WORDS"
    | "TRUE_FALSE"
    | "MATCHING"
    | "DRAG_DROP";
  title: string;
  order: number;
  content: any;
  answers: {
    id: number;
    text: string;
    order: number;
  }[];
  isActive: boolean;
  unit: {
    name: string;
  };
}

export interface TestData {
  testAttemptId: number;
  lesson: {
    id: number;
    name: string;
    description: string;
  };
  questions: Question[];
  totalQuestions: number;
}

export interface TestResultsInterface {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  experienceGained: number;
  heartsLost: number;
  timeQuizInSeconds: number;
}

export type Lesson = {
  id: number;
  name: string;
  description?: string | null;
  position: number;
  unitId: number;
  mandatory: boolean;
  experiencePoints: number;
  isActive: boolean;
};

export type LessonAdmin = {
  id: number;
  name: string;
  description?: string | null;
  position: number;
  unitId: number;
  createdAt: string;
  updatedAt: string;
  experiencePoints: number;
  isActive: boolean;
  mandatory: boolean;
  unit: {
    name: string;
  };
  _count: { questions: number };
};

export type Unit = {
  id: number;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  _count: { lessons: number; questions: number };
  lessons?: Lesson[];
  createdAt: Date;
  experiencePoints: number;
  mandatory: boolean;
  position: number;
  curriculumId?: string;
  curriculum?: {
    title: string;
    id: string;
  };
};

export type EducationalNFT = {
  id: string;
  tokenId: string;
  userId: string;
  unitId: string;
  contractAddress: string;
  transactionHash?: string;
  metadataUri: string;
  mintedAt: string;
  nftAssetId: number;
};

export type NFTAsset = {
  id: number;
  name: string;
  imageUrl: string;
  rarity: "NORMAL" | "RARE" | "EPIC" | "UNIQUE";
  isUsed: boolean;
  metadataUri?: string;
  createdAt: Date;
  usedAt?: Date;
  educationalNFT?: EducationalNFT;
  collectionId?: string;
  collection?: {
    id: string;
    name: string;
  };
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type NFTAssetsResponse = {
  nftAssets: NFTAsset[];
  pagination: Pagination;
  stats: {
    rarity: string;
    isUsed: boolean;
    _count: number;
  }[];
};

export type Curriculum = {
  id: string;
  title: string;
  audienceAgeRange: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  units: Unit[];
};

export interface UserGamification {
  currentZaps: number;
  currentHearts: number;
  exchangeRate: string;
  canPurchase: number;
  zapCostForOne: number;
  maxHearts: number;
}

export interface StoreContentProps {
  onBack: () => void;
  showBackButton?: boolean;
  onHeartsUpdate?: (hearts: number) => void;
  title?: string;
  backButtonVariant?: "icon" | "button";
}

export interface ZapPackage {
  amount: number;
  price: string;
  icon: React.ReactNode;
}

export interface PurchaseResponse {
  data: {
    hearts: number;
    zapTokens: number;
  };
  error?: string;
}

export interface ContentsResponse {
  curriculum: Curriculum;
  units: Unit[];
  stats: { totalAnswerErrors: number };
}

export interface SubscriptionData {
  subscriptionStatus: string;
  subscriptionCurrentPeriodEnd: string;
  subscriptionTrialEnd: string | null;
  subscriptionCancelAtPeriodEnd: boolean;
  subscription: {
    platform: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialStart: string | null;
    trialEnd: string | null;
    cancelAtPeriodEnd: boolean;
    stripeSubscriptionId: string;
  } | null;
  isActive: boolean;
  isPremium: boolean;
  isTrialing: boolean;
  status: string;
  platform?: string;
  daysLeft?: number;
  willCancelAtPeriodEnd: boolean;
}

export interface HomeAppResponse {
  isPremium: boolean;
  gamification: {
    hearts: number;
    maxHearts: number;
    zapTokens: number;
    totalCurriculumsCompleted: number;
    unitTokens: any[];
    needsHeartReset: boolean;
    canPurchaseHeart: boolean;
  };
}
