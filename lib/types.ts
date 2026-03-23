export interface Form {
  id: string;
  name: string;
  members: string[];
  createdAt: string;
  reviews: Review[];
}

export interface Review {
  reviewer: string;
  scores: Record<string, number>;
  createdAt: string;
}

export interface ReportData {
  formName: string;
  totalMembers: number;
  submittedCount: number;
  notSubmitted: string[];
  rankings: RankingEntry[];
}

export interface RankingEntry {
  rank: number;
  member: string;
  totalPoints: number;
  contributionPercent: number;
}

export interface CreateFormRequest {
  name: string;
  members: string[];
}

export interface SubmitReviewRequest {
  formId: string;
  reviewer: string;
  scores: Record<string, number>;
}
