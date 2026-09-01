import mongoose, { Schema, Model } from 'mongoose';
import { Form } from './types';

const CriterionSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true }
}, { _id: false });

const ReviewSchema = new Schema({
  reviewer: { type: String, required: true },
  scores: { type: Schema.Types.Mixed, required: true },
  selfContributionPercent: { type: Number, required: false },
  selfRatings: { type: Schema.Types.Mixed, required: false },
  peerRatings: { type: Schema.Types.Mixed, required: false },
  createdAt: { type: String, required: true }
}, { _id: false });

const FormSchema = new Schema<Form>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  members: [{ type: String, required: true }],
  createdAt: { type: String, required: true },
  criteria: { type: [CriterionSchema], default: [] },
  reviews: [ReviewSchema]
}, {
  timestamps: false,
  versionKey: false
});

if (mongoose.models.Form) {
  delete mongoose.models.Form;
}

export const FormModel: Model<Form> = mongoose.model<Form>('Form', FormSchema);
