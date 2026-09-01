export interface Criterion {
  id: string;
  name: string;
}

export interface Form {
  id: string;
  name: string;
  members: string[];
  createdAt: string;
  criteria: Criterion[];
  reviews: Review[];
}

export interface Review {
  reviewer: string;
  scores: Record<string, number>;
  selfContributionPercent?: number;
  selfRatings?: Record<string, number>;
  peerRatings?: Record<string, Record<string, number>>;
  createdAt: string;
}

export interface ReportData {
  formName: string;
  totalMembers: number;
  submittedCount: number;
  notSubmitted: string[];
  rankings: RankingEntry[];
  criteria: Criterion[];
  perceptions: MemberPerception[];
}

export interface RankingEntry {
  rank: number;
  member: string;
  totalPoints: number;
  contributionPercent: number;
}

export type BiasLabel = 'aligned' | 'overconfident' | 'underconfident';
export type JohariQuadrant = 'open' | 'hidden' | 'blind' | 'unknown';

export interface SkillPerception {
  criterionId: string;
  name: string;
  selfScore: number | null;
  peerAverage: number | null;
  gap: number | null;
  bias: BiasLabel | null;
  quadrant: JohariQuadrant | null;
}

export interface MemberPerception {
  member: string;
  hasSelfEval: boolean;
  selfContributionPercent: number | null;
  peerContributionPercent: number;
  contributionGap: number | null;
  contributionBias: BiasLabel | null;
  skills: SkillPerception[];
  overallBias: BiasLabel | null;
}

export interface CreateFormRequest {
  name: string;
  members: string[];
  criteria: { name: string }[];
}

export interface SubmitReviewRequest {
  formId: string;
  reviewer: string;
  scores: Record<string, number>;
  selfContributionPercent?: number;
  selfRatings?: Record<string, number>;
  peerRatings?: Record<string, Record<string, number>>;
}
