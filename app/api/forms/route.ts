import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createForm, getAllForms } from '@/lib/db';
import { validateFormCreation } from '@/lib/utils';
import { CreateFormRequest, Form } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateFormRequest = await request.json();
    const { name, members } = body;
    
    const error = validateFormCreation(name, members);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    
    const form: Form = {
      id: nanoid(10),
      name: name.trim(),
      members: members.map(m => m.trim()),
      createdAt: new Date().toISOString(),
      reviews: []
    };
    
    await createForm(form);
    
    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { error: 'Không thể tạo form' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const forms = await getAllForms();
    return NextResponse.json(forms);
  } catch (error) {
    console.error('Error getting forms:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách form' },
      { status: 500 }
    );
  }
}
