import { promises as fs } from 'fs';
import path from 'path';
import { Form, Review } from './types';

const DATA_DIR = path.join(process.cwd(), 'data', 'forms');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

export async function createForm(form: Form): Promise<Form> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${form.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(form, null, 2), 'utf-8');
  return form;
}

export async function getForm(formId: string): Promise<Form | null> {
  try {
    const filePath = path.join(DATA_DIR, `${formId}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as Form;
  } catch (error) {
    return null;
  }
}

export async function getAllForms(): Promise<Form[]> {
  try {
    await ensureDataDir();
    const files = await fs.readdir(DATA_DIR);
    const forms: Form[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(DATA_DIR, file);
        const data = await fs.readFile(filePath, 'utf-8');
        forms.push(JSON.parse(data) as Form);
      }
    }
    
    return forms.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    return [];
  }
}

export async function addReview(formId: string, review: Review): Promise<Form | null> {
  const form = await getForm(formId);
  if (!form) return null;
  
  const existingReviewIndex = form.reviews.findIndex(r => r.reviewer === review.reviewer);
  if (existingReviewIndex !== -1) {
    return null;
  }
  
  form.reviews.push(review);
  
  const filePath = path.join(DATA_DIR, `${formId}.json`);
  await fs.writeFile(filePath, JSON.stringify(form, null, 2), 'utf-8');
  
  return form;
}

export async function getAvailableMembers(formId: string): Promise<string[]> {
  const form = await getForm(formId);
  if (!form) return [];
  
  const submittedReviewers = form.reviews.map(r => r.reviewer);
  return form.members.filter(member => !submittedReviewers.includes(member));
}
