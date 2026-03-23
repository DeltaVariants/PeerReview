'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { isLeaderAuthenticated } from '@/lib/auth';
import { ReportData } from '@/lib/types';
import { Trophy, Users, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReportPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string;

  useEffect(() => {
    if (!isLeaderAuthenticated()) {
      router.push('/leader/login');
      return;
    }

    fetchReport();
  }, [router, formId]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}/report`);
      
      if (!response.ok) {
        setError('Không thể tải báo cáo');
        return;
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Đang tải báo cáo...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Không tìm thấy báo cáo'}</div>
      </div>
    );
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800';
    if (rank === 2) return 'bg-gray-100 text-gray-800';
    if (rank === 3) return 'bg-orange-100 text-orange-800';
    return 'bg-blue-50 text-blue-800';
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 30) return 'bg-green-500';
    if (percent >= 20) return 'bg-blue-500';
    if (percent >= 10) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/leader/forms"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft size={20} />
            Về Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {report.formName}
          </h1>
          <p className="text-gray-600">Báo cáo kết quả Peer Review</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {report.totalMembers}
                </div>
                <div className="text-sm text-gray-600">Tổng thành viên</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {report.submittedCount}
                </div>
                <div className="text-sm text-gray-600">Đã submit</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle size={20} className="text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {report.notSubmitted.length}
                </div>
                <div className="text-sm text-gray-600">Chưa submit</div>
              </div>
            </div>
          </div>
        </div>

        {report.notSubmitted.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">
              Chưa submit ({report.notSubmitted.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.notSubmitted.map((member) => (
                <span
                  key={member}
                  className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {member}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy size={24} className="text-yellow-500" />
              Bảng xếp hạng
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Hạng
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Thành viên
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Tổng điểm
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    % Đóng góp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.rankings.map((entry) => (
                  <tr key={entry.member} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${getRankColor(entry.rank)}`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {entry.member}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {entry.totalPoints}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-xs">
                          <div
                            className={`h-3 rounded-full transition-all ${getProgressColor(entry.contributionPercent)}`}
                            style={{ width: `${entry.contributionPercent}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 min-w-[60px] text-right">
                          {entry.contributionPercent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
