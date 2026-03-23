import connectDB from './mongodb';
import { FormModel } from './models';
import { Form, Review } from './types';

export async function createForm(form: Form): Promise<Form> {
  await connectDB();
  const newForm = new FormModel(form);
  await newForm.save();
  return form;
}

export async function getForm(formId: string): Promise<Form | null> {
  try {
    await connectDB();
    const form = await FormModel.findOne({ id: formId }).lean();
    if (!form) return null;
    
    return form as Form;
  } catch (error) {
    console.error('Error getting form:', error);
    return null;
  }
}

export async function getAllForms(): Promise<Form[]> {
  try {
    await connectDB();
    const forms = await FormModel.find().sort({ createdAt: -1 }).lean();
    
    return forms as Form[];
  } catch (error) {
    console.error('Error getting all forms:', error);
    return [];
  }
}

export async function addReview(formId: string, review: Review): Promise<Form | null> {
  try {
    await connectDB();
    
    const form = await FormModel.findOne({ id: formId });
    if (!form) return null;
    
    const existingReviewIndex = form.reviews.findIndex(r => r.reviewer === review.reviewer);
    if (existingReviewIndex !== -1) {
      return null;
    }
    
    form.reviews.push(review);
    await form.save();
    
    return form.toObject() as Form;
  } catch (error) {
    console.error('Error adding review:', error);
    return null;
  }
}

export async function getAvailableMembers(formId: string): Promise<string[]> {
  const form = await getForm(formId);
  if (!form) return [];
  
  const submittedReviewers = form.reviews.map(r => r.reviewer);
  return form.members.filter(member => !submittedReviewers.includes(member));
}
