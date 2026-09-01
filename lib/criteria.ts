import { Criterion } from './types';

export const DEFAULT_CRITERIA_NAMES = [
  'Giao tiếp',
  'Kỹ năng giải quyết vấn đề',
  'Mức độ đúng hạn',
  'Thái độ hợp tác',
] as const;

export const MIN_CRITERIA = 1;
export const MAX_CRITERIA = 10;
export const RATING_MIN = 1;
export const RATING_MAX = 5;
export const SKILL_BIAS_THRESHOLD = 0.5;
export const CONTRIBUTION_BIAS_THRESHOLD = 5;
export const JOHARI_MIDPOINT = 3;

export const RATING_LABELS = ['Yếu', 'Kém', 'Trung bình', 'Tốt', 'Xuất sắc'] as const;

export function isValidRating(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= RATING_MIN && value <= RATING_MAX;
}

export function percentToRadarValue(percent: number): number {
  return Math.round((percent / 20) * 100) / 100;
}

export function hasCompleteSelfEval(
  criteria: Criterion[],
  selfContributionPercent: number,
  selfRatings: Record<string, number>
): boolean {
  if (
    typeof selfContributionPercent !== 'number' ||
    Number.isNaN(selfContributionPercent) ||
    selfContributionPercent < 0 ||
    selfContributionPercent > 100
  ) {
    return false;
  }

  return criteria.every(c => isValidRating(selfRatings[c.id]));
}

export function hasCompletePeerRatings(
  otherMembers: string[],
  criteria: Criterion[],
  peerRatings: Record<string, Record<string, number>>
): boolean {
  return otherMembers.every(member =>
    criteria.every(c => isValidRating(peerRatings[member]?.[c.id]))
  );
}
