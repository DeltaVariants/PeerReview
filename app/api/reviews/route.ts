import { NextRequest, NextResponse } from 'next/server';
import { getForm, addReview } from '@/lib/db';
import { validateReview } from '@/lib/utils';
import { SubmitReviewRequest, Review } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: SubmitReviewRequest = await request.json();
    const { formId, reviewer, scores } = body;
    
    const form = await getForm(formId);
    if (!form) {
      return NextResponse.json(
        { error: 'Không tìm thấy form' },
        { status: 404 }
      );
    }
    
    const existingReview = form.reviews.find(r => r.reviewer === reviewer);
    if (existingReview) {
      return NextResponse.json(
        { error: 'Bạn đã submit đánh giá rồi' },
        { status: 400 }
      );
    }
    
    const error = validateReview(reviewer, scores, form.members);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    
    const review: Review = {
      reviewer,
      scores,
      createdAt: new Date().toISOString()
    };
    
    const updatedForm = await addReview(formId, review);
    
    if (!updatedForm) {
      return NextResponse.json(
        { error: 'Không thể lưu đánh giá' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Không thể submit đánh giá' },
      { status: 500 }
    );
  }
}
