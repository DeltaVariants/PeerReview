import { NextRequest, NextResponse } from 'next/server';
import { getForm } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const form = await getForm(formId);
    
    if (!form) {
      return NextResponse.json(
        { error: 'Không tìm thấy form' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(form);
  } catch (error) {
    console.error('Error getting form:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thông tin form' },
      { status: 500 }
    );
  }
}
