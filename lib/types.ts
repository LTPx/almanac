export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null | undefined;
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
  lesson: {
    name: string;
    unit: {
      name: string;
    };
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
  _count: { lessons: number };
  lessons?: Lesson[];
  createdAt: Date;
  experiencePoints: number;
  mandatory: boolean;
  position: number;
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
  imageUrl: string;
  rarity: "NORMAL" | "RARE" | "EPIC" | "UNIQUE";
  isUsed: boolean;
  metadataUri?: string;
  createdAt: Date;
  usedAt?: Date;
  educationalNFT?: EducationalNFT;
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
