'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Form } from '@/lib/types';
import { Check, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { RatingScale } from '@/components/RatingScale';
import { hasCompletePeerRatings, hasCompleteSelfEval } from '@/lib/criteria';

type WizardStep = 'self' | 'peers';

function WizardProgress({ step, hasRubric }: { step: WizardStep; hasRubric: boolean }) {
  if (!hasRubric) {
    return null;
  }

  const isSelf = step === 'self';

  return (
    <div className="flex items-center gap-3 mb-8">
      <div className={`flex-1 rounded-xl px-4 py-3 border-2 ${isSelf ? 'border-blue-600 bg-blue-50' : 'border-green-200 bg-green-50'}`}>
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bước 1</div>
        <div className="font-semibold text-gray-900">Tự đánh giá</div>
      </div>
      <ArrowRight size={20} className="text-gray-400 shrink-0" />
      <div className={`flex-1 rounded-xl px-4 py-3 border-2 ${!isSelf ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bước 2</div>
        <div className="font-semibold text-gray-900">Đánh giá đồng đội</div>
      </div>
    </div>
  );
}

export default function ReviewStartPage() {
  const [form, setForm] = useState<Form | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [selfContributionPercent, setSelfContributionPercent] = useState(0);
  const [selfRatings, setSelfRatings] = useState<Record<string, number>>({});
  const [peerRatings, setPeerRatings] = useState<Record<string, Record<string, number>>>({});
  const [step, setStep] = useState<WizardStep>('self');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const formId = params.formId as string;
  const reviewer = searchParams.get('reviewer') || '';

  useEffect(() => {
    if (!reviewer) {
      router.push(`/review/${formId}`);
      return;
    }

    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`);
        
        if (!response.ok) {
          setError('Không tìm thấy form');
          return;
        }

        const data: Form = await response.json();
        setForm(data);

        const otherMembers = data.members.filter((m) => m !== reviewer);
        const evenScore = Math.floor(100 / otherMembers.length);
        const remainder = 100 % otherMembers.length;
        const initialScores: Record<string, number> = {};

        otherMembers.forEach((member, index) => {
          initialScores[member] = evenScore + (index === 0 ? remainder : 0);
        });

        setScores(initialScores);
        setSelfContributionPercent(Math.round(100 / data.members.length));
        setStep((data.criteria?.length ?? 0) > 0 ? 'self' : 'peers');
      } catch {
        setError('Lỗi kết nối');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId, reviewer, router]);

  const handleScoreChange = (member: string, value: number) => {
    const newValue = Math.max(0, Math.min(100, value));
    setScores(current => ({
      ...current,
      [member]: newValue
    }));
  };

  const handlePeerRatingChange = (member: string, criterionId: string, value: number) => {
    setPeerRatings(current => ({
      ...current,
      [member]: {
        ...current[member],
        [criterionId]: value,
      },
    }));
  };

  const getTotalScore = () => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const handleSubmit = async () => {
    if (!form) return;

    const total = getTotalScore();
    
    if (total !== 100) {
      setError(`Tổng điểm phải bằng 100 (hiện tại: ${total})`);
      return;
    }

    setError('');
    setSubmitting(true);

    const hasRubric = (form.criteria?.length ?? 0) > 0;

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId,
          reviewer,
          scores,
          ...(hasRubric
            ? { selfContributionPercent, selfRatings, peerRatings }
            : {}),
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Không thể submit đánh giá');
      }
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cảm ơn bạn!
          </h1>
          <p className="text-gray-600 mb-6">
            Đánh giá của bạn đã được ghi nhận thành công.
          </p>
          <p className="text-sm text-gray-500">
            Bạn có thể đóng trang này.
          </p>
        </div>
      </div>
    );
  }

  if (!form) return null;

  const criteria = form.criteria ?? [];
  const hasRubric = criteria.length > 0;
  const otherMembers = form.members.filter(m => m !== reviewer);
  const total = getTotalScore();
  const isScoreValid = total === 100;
  const isSelfValid = hasCompleteSelfEval(criteria, selfContributionPercent, selfRatings);
  const isPeerRatingsValid = !hasRubric || hasCompletePeerRatings(otherMembers, criteria, peerRatings);
  const canSubmit = isScoreValid && isPeerRatingsValid;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bạn đang review: <span className="text-blue-600">{reviewer}</span>
            </h1>
            <p className="text-gray-600">
              {hasRubric
                ? 'Hoàn thành tự đánh giá trước, sau đó phân bổ 100 điểm và chấm rubric cho đồng đội.'
                : 'Phân bổ 100 điểm cho các thành viên khác trong team'}
            </p>
          </div>

          <WizardProgress step={step} hasRubric={hasRubric} />

          {step === 'self' && hasRubric ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 text-sm text-blue-900">
                Ước lượng % đóng góp của bạn trong team (không cần tổng với người khác bằng 100).
                Sau đó chấm kỹ năng của chính mình từ 1 (Yếu) đến 5 (Xuất sắc).
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    % đóng góp của tôi
                  </h3>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selfContributionPercent}
                    onChange={(e) =>
                      setSelfContributionPercent(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))
                    }
                    className="w-24 px-4 py-2 border-2 border-gray-400 bg-white text-gray-900 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selfContributionPercent}
                  onChange={(e) => setSelfContributionPercent(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${selfContributionPercent}%, #e5e7eb ${selfContributionPercent}%, #e5e7eb 100%)`
                  }}
                />
              </div>

              <div className="space-y-5 mb-8">
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="bg-gray-50 rounded-xl p-5">
                    <RatingScale
                      label={criterion.name}
                      value={selfRatings[criterion.id]}
                      onChange={(value) =>
                        setSelfRatings(current => ({ ...current, [criterion.id]: value }))
                      }
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (!isSelfValid) {
                    setError('Hãy nhập % đóng góp và chấm đủ các tiêu chí trước khi tiếp tục');
                    return;
                  }
                  setError('');
                  setStep('peers');
                }}
                disabled={!isSelfValid}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
              >
                Tiếp tục đánh giá đồng đội
                <ArrowRight size={20} />
              </button>
            </>
          ) : (
            <>
              <div className="space-y-6 mb-8">
                {otherMembers.map((member) => (
                  <div key={member} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {member}
                      </h3>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores[member] || 0}
                        onChange={(e) => handleScoreChange(member, parseInt(e.target.value) || 0)}
                        className="w-24 px-4 py-2 border-2 border-gray-400 bg-white text-gray-900 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={scores[member] || 0}
                      onChange={(e) => handleScoreChange(member, parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${scores[member] || 0}%, #e5e7eb ${scores[member] || 0}%, #e5e7eb 100%)`
                      }}
                    />
                    {hasRubric ? (
                      <div className="mt-5 pt-5 border-t border-gray-200 space-y-4">
                        <p className="text-sm font-medium text-gray-600">Rubric 1–5</p>
                        {criteria.map((criterion) => (
                          <RatingScale
                            key={criterion.id}
                            label={criterion.name}
                            value={peerRatings[member]?.[criterion.id]}
                            onChange={(value) => handlePeerRatingChange(member, criterion.id, value)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className={`rounded-xl p-6 mb-6 ${isScoreValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isScoreValid ? (
                      <Check size={24} className="text-green-600" />
                    ) : (
                      <AlertCircle size={24} className="text-red-600" />
                    )}
                    <span className={`text-lg font-semibold ${isScoreValid ? 'text-green-900' : 'text-red-900'}`}>
                      Tổng điểm:
                    </span>
                  </div>
                  <span className={`text-3xl font-bold ${isScoreValid ? 'text-green-600' : 'text-red-600'}`}>
                    {total} / 100
                  </span>
                </div>
              </div>

              {hasRubric && !isPeerRatingsValid ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 text-sm">
                  Hãy chấm đủ rubric 1–5 cho tất cả thành viên trước khi submit.
                </div>
              ) : null}

              <div className="flex gap-3">
                {hasRubric ? (
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setStep('self');
                    }}
                    className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-lg transition"
                  >
                    <ArrowLeft size={20} />
                    Quay lại
                  </button>
                ) : null}
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {submitting ? 'Đang submit...' : 'Submit Đánh Giá'}
                </button>
              </div>
            </>
          )}

          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
