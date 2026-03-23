'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form } from '@/lib/types';
import { Users, ArrowRight } from 'lucide-react';

export default function ReviewSelectPage() {
  const [form, setForm] = useState<Form | null>(null);
  const [availableMembers, setAvailableMembers] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string;

  useEffect(() => {
    fetchFormData();
  }, [formId]);

  const fetchFormData = async () => {
    try {
      const [formRes, membersRes] = await Promise.all([
        fetch(`/api/forms/${formId}`),
        fetch(`/api/forms/${formId}/available-members`)
      ]);

      if (!formRes.ok) {
        setError('Không tìm thấy form');
        return;
      }

      const formData = await formRes.json();
      const membersData = await membersRes.json();

      setForm(formData);
      setAvailableMembers(membersData.members);
    } catch (err) {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (selectedMember) {
      router.push(`/review/${formId}/start?reviewer=${encodeURIComponent(selectedMember)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">
            {error || 'Không tìm thấy form'}
          </div>
        </div>
      </div>
    );
  }

  if (availableMembers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Hoàn thành!
          </h1>
          <p className="text-gray-600">
            Tất cả thành viên đã hoàn thành đánh giá cho form này.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {form.name}
            </h1>
            <p className="text-gray-600">
              Chọn tên của bạn để bắt đầu đánh giá
            </p>
          </div>

          <div className="mb-8">
            <label htmlFor="member" className="block text-sm font-medium text-gray-700 mb-3">
              Tên của bạn
            </label>
            <select
              id="member"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-4 py-4 border-2 border-gray-400 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg font-medium"
            >
              <option value="">-- Chọn tên của bạn --</option>
              {availableMembers.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Lưu ý:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Bạn có 100 điểm để phân bổ cho các thành viên khác</li>
              <li>• Không được chấm điểm cho bản thân</li>
              <li>• Tổng điểm phải bằng 100</li>
              <li>• Mỗi người chỉ được submit 1 lần</li>
            </ul>
          </div>

          <button
            onClick={handleStart}
            disabled={!selectedMember}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            Bắt đầu Review
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
