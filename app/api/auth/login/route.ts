import { NextRequest, NextResponse } from 'next/server';
import { checkLeaderPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (checkLeaderPassword(password)) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Mật khẩu không đúng' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Lỗi đăng nhập' },
      { status: 500 }
    );
  }
}
