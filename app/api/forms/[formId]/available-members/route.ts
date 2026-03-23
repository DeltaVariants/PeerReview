import { NextRequest, NextResponse } from 'next/server';
import { getAvailableMembers } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const members = await getAvailableMembers(formId);
    
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error getting available members:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách thành viên' },
      { status: 500 }
    );
  }
}
