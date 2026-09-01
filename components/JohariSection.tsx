'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { BiasLabel, JohariQuadrant, MemberPerception, ReportData, SkillPerception } from '@/lib/types';
import { percentToRadarValue } from '@/lib/criteria';
import { Eye } from 'lucide-react';
import type { PerceptionRadarPoint } from './PerceptionRadar';

const PerceptionRadar = dynamic(
  () => import('./PerceptionRadar').then(mod => mod.PerceptionRadar),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 flex items-center justify-center text-gray-500">
        Đang tải biểu đồ...
      </div>
    ),
  }
);

const BIAS_LABELS: Record<BiasLabel, string> = {
  aligned: 'Cân bằng',
  overconfident: 'Ảo tưởng / đánh giá cao mình',
  underconfident: 'Tự ti / đánh giá thấp mình',
};

const BIAS_CLASSES: Record<BiasLabel, string> = {
  aligned: 'bg-green-100 text-green-800',
  overconfident: 'bg-amber-100 text-amber-800',
  underconfident: 'bg-sky-100 text-sky-800',
};

const QUADRANT_META: Record<JohariQuadrant, { title: string; hint: string; box: string }> = {
  open: {
    title: 'Vùng mở',
    hint: 'Cả hai đều thấy điểm mạnh',
    box: 'bg-green-50 border-green-200',
  },
  hidden: {
    title: 'Vùng ẩn',
    hint: 'Ảo tưởng — tự đánh giá cao hơn tập thể',
    box: 'bg-amber-50 border-amber-200',
  },
  blind: {
    title: 'Vùng mù',
    hint: 'Tự ti — tập thể đánh giá cao hơn',
    box: 'bg-sky-50 border-sky-200',
  },
  unknown: {
    title: 'Vùng chưa biết',
    hint: 'Cả hai đều thấy điểm cần cải thiện',
    box: 'bg-gray-50 border-gray-200',
  },
};

function BiasBadge({ bias }: { bias: BiasLabel | null }) {
  if (!bias) {
    return <span className="text-sm text-gray-500">Chưa đủ dữ liệu</span>;
  }

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${BIAS_CLASSES[bias]}`}>
      {BIAS_LABELS[bias]}
    </span>
  );
}

function formatScore(value: number | null): string {
  if (value === null) return '—';
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function skillsByQuadrant(skills: SkillPerception[], quadrant: JohariQuadrant): SkillPerception[] {
  return skills.filter(skill => skill.quadrant === quadrant);
}

function buildRadarData(perception: MemberPerception): PerceptionRadarPoint[] {
  const points: PerceptionRadarPoint[] = perception.skills
    .filter(skill => skill.selfScore !== null)
    .map(skill => ({
      subject: skill.name,
      self: skill.selfScore as number,
      peer: skill.peerAverage ?? 0,
    }));

  if (perception.selfContributionPercent !== null) {
    points.push({
      subject: 'Đóng góp',
      self: percentToRadarValue(perception.selfContributionPercent),
      peer: percentToRadarValue(perception.peerContributionPercent),
    });
  }

  return points;
}

export function JohariSection({ report }: { report: ReportData }) {
  const membersWithSelfEval = useMemo(
    () => report.perceptions.filter(item => item.hasSelfEval),
    [report.perceptions]
  );

  const [selectedMember, setSelectedMember] = useState(
    membersWithSelfEval[0]?.member ?? ''
  );

  const perception = membersWithSelfEval.find(item => item.member === selectedMember)
    ?? membersWithSelfEval[0]
    ?? null;

  if (report.criteria.length === 0 && membersWithSelfEval.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mt-6">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Eye size={24} className="text-indigo-600" />
          Góc nhìn cá nhân vs tập thể
        </h2>
        <p className="text-gray-600 mt-1">
          So sánh tự đánh giá với trung bình đồng đội (Johari Window).
        </p>
      </div>

      {membersWithSelfEval.length === 0 || !perception ? (
        <div className="p-8 text-gray-600">
          Chưa có dữ liệu tự đánh giá. Khi thành viên hoàn thành bước 1, biểu đồ sẽ xuất hiện tại đây.
        </div>
      ) : (
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {membersWithSelfEval.map(item => (
              <button
                key={item.member}
                type="button"
                onClick={() => setSelectedMember(item.member)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  item.member === perception.member
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.member}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-sm text-gray-600">Nhận định tổng:</span>
            <BiasBadge bias={perception.overallBias} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Biểu đồ so sánh</h3>
              <p className="text-xs text-gray-500 mb-2">
                Trục đóng góp được quy đổi 0–100% thành 0–5 để cùng thang rubric.
              </p>
              <PerceptionRadar data={buildRadarData(perception)} />
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-4">% đóng góp</h3>
              <ContributionBars perception={perception} />
              <div className="mt-4">
                <span className="text-sm text-gray-600 mr-2">Khoảng lệch đóng góp:</span>
                <BiasBadge bias={perception.contributionBias} />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Tiêu chí</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Cá nhân</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Tập thể</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Lệch</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Nhận định</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {perception.skills.map(skill => (
                  <tr key={skill.criterionId}>
                    <td className="px-4 py-3 font-medium text-gray-900">{skill.name}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{formatScore(skill.selfScore)}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{formatScore(skill.peerAverage)}</td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {skill.gap === null ? '—' : (skill.gap > 0 ? `+${formatScore(skill.gap)}` : formatScore(skill.gap))}
                    </td>
                    <td className="px-4 py-3"><BiasBadge bias={skill.bias} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-semibold text-gray-900 mb-3">Johari Window</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {(['open', 'hidden', 'blind', 'unknown'] as JohariQuadrant[]).map(quadrant => {
              const meta = QUADRANT_META[quadrant];
              const items = skillsByQuadrant(perception.skills, quadrant);
              return (
                <div key={quadrant} className={`rounded-xl border p-4 ${meta.box}`}>
                  <div className="font-semibold text-gray-900">{meta.title}</div>
                  <p className="text-sm text-gray-600 mb-3">{meta.hint}</p>
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-500">Không có tiêu chí</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {items.map(item => (
                        <span
                          key={item.criterionId}
                          className="bg-white/80 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ContributionBars({ perception }: { perception: MemberPerception }) {
  const self = perception.selfContributionPercent ?? 0;
  const peer = perception.peerContributionPercent;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-blue-700">Cá nhân</span>
          <span className="font-bold text-gray-900">{formatScore(perception.selfContributionPercent)}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full">
          <div className="h-3 rounded-full bg-blue-500" style={{ width: `${Math.min(self, 100)}%` }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-emerald-700">Tập thể</span>
          <span className="font-bold text-gray-900">{formatScore(peer)}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full">
          <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.min(peer, 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
