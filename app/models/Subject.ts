import mongoose, { Schema, Document } from 'mongoose';

interface ISubject extends Document {
  name: string;
  credits: number;
  category: string;
}

const SubjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  category: { type: String, required: true },
});

export default mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
