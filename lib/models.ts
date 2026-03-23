import mongoose, { Schema, Model } from 'mongoose';
import { Form } from './types';

const ReviewSchema = new Schema({
  reviewer: { type: String, required: true },
  scores: { type: Object, required: true },
  createdAt: { type: String, required: true }
}, { _id: false });

const FormSchema = new Schema<Form>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  members: [{ type: String, required: true }],
  createdAt: { type: String, required: true },
  reviews: [ReviewSchema]
}, {
  timestamps: false,
  versionKey: false
});

export const FormModel: Model<Form> = mongoose.models.Form || mongoose.model<Form>('Form', FormSchema);
