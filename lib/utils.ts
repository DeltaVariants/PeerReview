import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Form, ReportData, RankingEntry } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateFormCreation(name: string, members: string[]): string | null {
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
  
  return null;
}

export function validateReview(
  reviewer: string,
  scores: Record<string, number>,
  members: string[]
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
  
  return null;
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
        ? Math.round((totalPoints[member] / grandTotal) * 100 * 100) / 100
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
    rankings
  };
}
