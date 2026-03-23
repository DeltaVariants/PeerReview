import { NextRequest, NextResponse } from 'next/server';
import { getForm } from '@/lib/db';
import { calculateReport } from '@/lib/utils';

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
    
    const report = calculateReport(form);
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Không thể tạo báo cáo' },
      { status: 500 }
    );
  }
}
