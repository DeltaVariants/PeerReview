'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isLeaderAuthenticated, clearLeaderSession } from '@/lib/auth';
import { Form } from '@/lib/types';
import { Copy, Plus, FileText, LogOut } from 'lucide-react';

export default function LeaderFormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLeaderAuthenticated()) {
      router.push('/leader/login');
      return;
    }

    fetchForms();
  }, [router]);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/forms');
      const data = await response.json();
      setForms(data);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = (formId: string) => {
    const link = `${window.location.origin}/review/${formId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = () => {
    clearLeaderSession();
    router.push('/leader/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Forms</h1>
            <p className="text-gray-600 mt-1">Tạo và quản lý các form peer review</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/leader/forms/create"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              <Plus size={20} />
              Tạo Form Mới
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold transition"
            >
              <LogOut size={20} />
              Đăng xuất
            </button>
          </div>
        </div>

        {forms.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có form nào
            </h3>
            <p className="text-gray-600 mb-6">
              Tạo form đầu tiên để bắt đầu thu thập đánh giá từ team
            </p>
            <Link
              href="/leader/forms/create"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              <Plus size={20} />
              Tạo Form Mới
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => {
              const submittedCount = form.reviews.length;
              const totalMembers = form.members.length;
              const progress = (submittedCount / totalMembers) * 100;

              return (
                <div
                  key={form.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {form.name}
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Thành viên:</span>
                      <span className="font-semibold text-gray-900">
                        {totalMembers} người
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Đã submit:</span>
                      <span className="font-semibold text-gray-900">
                        {submittedCount} / {totalMembers}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => copyShareLink(form.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      <Copy size={16} />
                      {copiedId === form.id ? 'Đã copy!' : 'Copy Link'}
                    </button>
                    <Link
                      href={`/leader/forms/${form.id}/report`}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Xem Report
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
