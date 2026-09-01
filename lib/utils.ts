import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Form,
  ReportData,
  RankingEntry,
  Criterion,
  BiasLabel,
  JohariQuadrant,
  SkillPerception,
  MemberPerception,
} from './types';
import {
  MIN_CRITERIA,
  MAX_CRITERIA,
  SKILL_BIAS_THRESHOLD,
  CONTRIBUTION_BIAS_THRESHOLD,
  JOHARI_MIDPOINT,
  isValidRating,
} from './criteria';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function validateCriteria(criteria: { name: string }[] | undefined): string | null {
  if (!criteria || criteria.length < MIN_CRITERIA) {
    return `Phải có ít nhất ${MIN_CRITERIA} tiêu chí đánh giá`;
  }

  if (criteria.length > MAX_CRITERIA) {
    return `Tối đa ${MAX_CRITERIA} tiêu chí đánh giá`;
  }

  if (criteria.some(c => !c.name || c.name.trim().length === 0)) {
    return 'Tên tiêu chí không được để trống';
  }

  const uniqueNames = new Set(criteria.map(c => c.name.trim().toLowerCase()));
  if (uniqueNames.size !== criteria.length) {
    return 'Tên tiêu chí không được trùng lặp';
  }

  return null;
}

export function validateFormCreation(
  name: string,
  members: string[],
  criteria?: { name: string }[]
): string | null {
  if (!name || name.trim().length === 0) {
    return 'Tên form không được để trống';
  }
  
  if (members.length < 2) {
    return 'Phải có ít nhất 2 thành viên';
  }
  
  const uniqueMembers = new Set(members.map(m => m.trim().toLowerCase()));
  if (uniqueMembers.size !== members.length) {
    return 'Tên thành viên không được trùng lặp';
  }
  
  if (members.some(m => !m || m.trim().length === 0)) {
    return 'Tên thành viên không được để trống';
  }

  const criteriaError = validateCriteria(criteria);
  if (criteriaError) {
    return criteriaError;
  }
  
  return null;
}

export function validateReview(
  reviewer: string,
  scores: Record<string, number>,
  members: string[],
  criteria: Criterion[] = [],
  selfEval?: {
    selfContributionPercent?: number;
    selfRatings?: Record<string, number>;
    peerRatings?: Record<string, Record<string, number>>;
  }
): string | null {
  const otherMembers = members.filter(m => m !== reviewer);
  
  if (Object.keys(scores).length !== otherMembers.length) {
    return 'Phải chấm điểm cho tất cả thành viên';
  }
  
  for (const member of otherMembers) {
    if (!(member in scores)) {
      return `Thiếu điểm cho ${member}`;
    }
    
    const score = scores[member];
    if (score < 0 || score > 100) {
      return `Điểm phải từ 0 đến 100`;
    }
  }
  
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  if (total !== 100) {
    return `Tổng điểm phải bằng 100 (hiện tại: ${total})`;
  }
  
  if (reviewer in scores) {
    return 'Không được chấm điểm cho bản thân';
  }

  if (criteria.length === 0) {
    return null;
  }

  const selfContributionPercent = selfEval?.selfContributionPercent;
  if (
    typeof selfContributionPercent !== 'number' ||
    Number.isNaN(selfContributionPercent) ||
    selfContributionPercent < 0 ||
    selfContributionPercent > 100
  ) {
    return '% đóng góp tự đánh giá phải từ 0 đến 100';
  }

  const selfRatings = selfEval?.selfRatings;
  if (!selfRatings) {
    return 'Thiếu tự đánh giá kỹ năng';
  }

  for (const criterion of criteria) {
    if (!isValidRating(selfRatings[criterion.id])) {
      return `Tự đánh giá "${criterion.name}" phải từ 1 đến 5`;
    }
  }

  const peerRatings = selfEval?.peerRatings;
  if (!peerRatings) {
    return 'Thiếu đánh giá kỹ năng cho các thành viên';
  }

  if (reviewer in peerRatings) {
    return 'Không được chấm rubric cho bản thân';
  }

  for (const member of otherMembers) {
    const memberRatings = peerRatings[member];
    if (!memberRatings) {
      return `Thiếu đánh giá kỹ năng cho ${member}`;
    }

    for (const criterion of criteria) {
      if (!isValidRating(memberRatings[criterion.id])) {
        return `Điểm "${criterion.name}" của ${member} phải từ 1 đến 5`;
      }
    }
  }
  
  return null;
}

function classifyBias(self: number, peer: number, threshold: number): BiasLabel {
  const gap = self - peer;
  if (Math.abs(gap) < threshold) {
    return 'aligned';
  }
  return gap > 0 ? 'overconfident' : 'underconfident';
}

function johariQuadrant(self: number, peer: number): JohariQuadrant {
  const selfHigh = self >= JOHARI_MIDPOINT;
  const peerHigh = peer >= JOHARI_MIDPOINT;
  if (selfHigh && peerHigh) return 'open';
  if (selfHigh && !peerHigh) return 'hidden';
  if (!selfHigh && peerHigh) return 'blind';
  return 'unknown';
}

function overallBias(biases: BiasLabel[]): BiasLabel | null {
  if (biases.length === 0) {
    return null;
  }

  let over = 0;
  let under = 0;
  let aligned = 0;

  for (const bias of biases) {
    if (bias === 'overconfident') over += 1;
    else if (bias === 'underconfident') under += 1;
    else aligned += 1;
  }

  if (aligned >= over && aligned >= under) return 'aligned';
  if (over > under) return 'overconfident';
  if (under > over) return 'underconfident';
  return 'aligned';
}

function peerAverageFor(
  reviews: Form['reviews'],
  member: string,
  criterionId: string
): number | null {
  const scores: number[] = [];

  for (const review of reviews) {
    if (review.reviewer === member) continue;
    const rating = review.peerRatings?.[member]?.[criterionId];
    if (typeof rating === 'number') {
      scores.push(rating);
    }
  }

  if (scores.length === 0) {
    return null;
  }

  const sum = scores.reduce((acc, score) => acc + score, 0);
  return round2(sum / scores.length);
}

function buildPerceptions(form: Form, rankings: RankingEntry[]): MemberPerception[] {
  const criteria = form.criteria ?? [];
  const contributionByMember = new Map(
    rankings.map(entry => [entry.member, entry.contributionPercent])
  );

  return form.reviews.map(review => {
    const peerContributionPercent = contributionByMember.get(review.reviewer) ?? 0;
    const selfContributionPercent =
      typeof review.selfContributionPercent === 'number'
        ? review.selfContributionPercent
        : null;

    const hasSelfEval =
      selfContributionPercent !== null &&
      (criteria.length === 0 ||
        criteria.every(c => isValidRating(review.selfRatings?.[c.id])));

    const contributionGap =
      selfContributionPercent !== null
        ? round2(selfContributionPercent - peerContributionPercent)
        : null;

    const contributionBias =
      selfContributionPercent !== null
        ? classifyBias(selfContributionPercent, peerContributionPercent, CONTRIBUTION_BIAS_THRESHOLD)
        : null;

    const skills: SkillPerception[] = criteria.map(criterion => {
      const selfScore = isValidRating(review.selfRatings?.[criterion.id])
        ? review.selfRatings![criterion.id]
        : null;
      const peerAverage = peerAverageFor(form.reviews, review.reviewer, criterion.id);
      const canCompare = selfScore !== null && peerAverage !== null;

      return {
        criterionId: criterion.id,
        name: criterion.name,
        selfScore,
        peerAverage,
        gap: canCompare ? round2(selfScore - peerAverage) : null,
        bias: canCompare ? classifyBias(selfScore, peerAverage, SKILL_BIAS_THRESHOLD) : null,
        quadrant: canCompare ? johariQuadrant(selfScore, peerAverage) : null,
      };
    });

    const biases: BiasLabel[] = [];
    if (contributionBias) biases.push(contributionBias);
    for (const skill of skills) {
      if (skill.bias) biases.push(skill.bias);
    }

    return {
      member: review.reviewer,
      hasSelfEval,
      selfContributionPercent,
      peerContributionPercent,
      contributionGap,
      contributionBias,
      skills,
      overallBias: overallBias(biases),
    };
  });
}

export function calculateReport(form: Form): ReportData {
  const totalPoints: Record<string, number> = {};
  
  form.members.forEach(member => {
    totalPoints[member] = 0;
  });
  
  form.reviews.forEach(review => {
    Object.entries(review.scores).forEach(([member, score]) => {
      totalPoints[member] = (totalPoints[member] || 0) + score;
    });
  });
  
  const grandTotal = Object.values(totalPoints).reduce((sum, points) => sum + points, 0);
  
  const rankings: RankingEntry[] = form.members
    .map(member => ({
      rank: 0,
      member,
      totalPoints: totalPoints[member] || 0,
      contributionPercent: grandTotal > 0 
        ? round2((totalPoints[member] / grandTotal) * 100)
        : 0
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  
  const submittedReviewers = form.reviews.map(r => r.reviewer);
  const notSubmitted = form.members.filter(m => !submittedReviewers.includes(m));
  
  return {
    formName: form.name,
    totalMembers: form.members.length,
    submittedCount: form.reviews.length,
    notSubmitted,
    rankings,
    criteria: form.criteria ?? [],
    perceptions: buildPerceptions(form, rankings),
  };
}
