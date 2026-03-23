'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Form } from '@/lib/types';
import { Check, AlertCircle } from 'lucide-react';

export default function ReviewStartPage() {
  const [form, setForm] = useState<Form | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
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

    fetchForm();
  }, [formId, reviewer]);

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}`);
      
      if (!response.ok) {
        setError('Không tìm thấy form');
        return;
      }

      const data = await response.json();
      setForm(data);

      const initialScores: Record<string, number> = {};
      const otherMembers = data.members.filter((m: string) => m !== reviewer);
      const evenScore = Math.floor(100 / otherMembers.length);
      const remainder = 100 % otherMembers.length;

      otherMembers.forEach((member: string, index: number) => {
        initialScores[member] = evenScore + (index === 0 ? remainder : 0);
      });

      setScores(initialScores);
    } catch (err) {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (member: string, value: number) => {
    const newValue = Math.max(0, Math.min(100, value));
    setScores({
      ...scores,
      [member]: newValue
    });
  };

  const getTotalScore = () => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const handleSubmit = async () => {
    const total = getTotalScore();
    
    if (total !== 100) {
      setError(`Tổng điểm phải bằng 100 (hiện tại: ${total})`);
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId,
          reviewer,
          scores
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Không thể submit đánh giá');
      }
    } catch (err) {
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

  const otherMembers = form.members.filter(m => m !== reviewer);
  const total = getTotalScore();
  const isValid = total === 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bạn đang review: <span className="text-blue-600">{reviewer}</span>
            </h1>
            <p className="text-gray-600">
              Phân bổ 100 điểm cho các thành viên khác trong team
            </p>
          </div>

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
              </div>
            ))}
          </div>

          <div className={`rounded-xl p-6 mb-6 ${isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isValid ? (
                  <Check size={24} className="text-green-600" />
                ) : (
                  <AlertCircle size={24} className="text-red-600" />
                )}
                <span className={`text-lg font-semibold ${isValid ? 'text-green-900' : 'text-red-900'}`}>
                  Tổng điểm:
                </span>
              </div>
              <span className={`text-3xl font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                {total} / 100
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {submitting ? 'Đang submit...' : 'Submit Đánh Giá'}
          </button>
        </div>
      </div>
    </div>
  );
}
