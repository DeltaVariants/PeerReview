import Link from 'next/link';
import { Users, Star, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Peer Review System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Hệ thống đánh giá nội bộ cho team - Thu thập feedback và đo lường đóng góp một cách công bằng
          </p>
          <Link
            href="/leader/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl"
          >
            Đăng nhập Leader
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Dễ sử dụng
            </h3>
            <p className="text-gray-600">
              Leader tạo form, member chấm điểm đơn giản qua link share
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Công bằng
            </h3>
            <p className="text-gray-600">
              Mỗi người phân bổ 100 điểm cho các thành viên khác
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Báo cáo chi tiết
            </h3>
            <p className="text-gray-600">
              Xem ranking và % đóng góp của từng thành viên
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Cách sử dụng
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Leader tạo form</h4>
                <p className="text-gray-600">Nhập tên form và danh sách thành viên</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Chia sẻ link</h4>
                <p className="text-gray-600">Copy và gửi link cho các thành viên trong team</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Member chấm điểm</h4>
                <p className="text-gray-600">Chọn tên và phân bổ 100 điểm cho các thành viên khác</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Xem báo cáo</h4>
                <p className="text-gray-600">Leader xem ranking và % đóng góp của từng người</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
