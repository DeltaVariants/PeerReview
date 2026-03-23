'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLeaderAuthenticated } from '@/lib/auth';
import { Plus, X, Copy, Check } from 'lucide-react';

export default function CreateFormPage() {
  const [formName, setFormName] = useState('');
  const [memberCount, setMemberCount] = useState(3);
  const [members, setMembers] = useState<string[]>(['', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdFormId, setCreatedFormId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLeaderAuthenticated()) {
      router.push('/leader/login');
    }
  }, [router]);

  useEffect(() => {
    const newMembers = Array(memberCount).fill('');
    members.forEach((member, index) => {
      if (index < memberCount) {
        newMembers[index] = member;
      }
    });
    setMembers(newMembers);
  }, [memberCount]);

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const filteredMembers = members.filter(m => m.trim().length > 0);

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          members: filteredMembers
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCreatedFormId(data.id);
      } else {
        setError(data.error || 'Không thể tạo form');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    if (createdFormId) {
      const link = `${window.location.origin}/review/${createdFormId}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (createdFormId) {
    const shareLink = `${window.location.origin}/review/${createdFormId}`;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Form đã được tạo!
            </h1>
            <p className="text-gray-600">
              Chia sẻ link dưới đây cho team của bạn
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-3 border-2 border-gray-400 bg-white text-gray-900 rounded-lg font-medium"
              />
              <button
                onClick={copyShareLink}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                <Copy size={20} />
                {copied ? 'Đã copy!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/leader/forms')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Về Dashboard
            </button>
            <button
              onClick={() => router.push(`/leader/forms/${createdFormId}/report`)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Xem Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tạo Form Peer Review
          </h1>
          <p className="text-gray-600 mb-8">
            Nhập thông tin để tạo form đánh giá mới
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="formName" className="block text-sm font-medium text-gray-700 mb-2">
                Tên Form *
              </label>
              <input
                id="formName"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-400 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-500"
                placeholder="Ví dụ: Team A - Sprint 5 Review"
                required
              />
            </div>

            <div>
              <label htmlFor="memberCount" className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng thành viên *
              </label>
              <input
                id="memberCount"
                type="number"
                min="2"
                max="20"
                value={memberCount}
                onChange={(e) => setMemberCount(parseInt(e.target.value) || 2)}
                className="w-full px-4 py-3 border-2 border-gray-400 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh sách thành viên *
              </label>
              <div className="space-y-3">
                {members.map((member, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="flex items-center justify-center w-10 h-12 bg-gray-100 rounded-lg font-semibold text-gray-600">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-400 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-500"
                      placeholder={`Tên thành viên ${index + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/leader/forms')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tạo...' : 'Tạo Form'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
