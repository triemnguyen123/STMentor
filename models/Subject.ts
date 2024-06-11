import mongoose, { Document, Schema } from 'mongoose';

interface SubjectDocument extends Document {
  name: string;
  credits: number;
  score: number;
  semester: string;
  STT: number;
  _id: string;
}

const SubjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  score: { type: Number, required: true },
  semester: { type: String, required: true },
  STT: { type: Number, required: true },
  _id: { type: String, required: true }
});

const Subject = mongoose.models.Subject || mongoose.model<SubjectDocument>('Subject', SubjectSchema);

export default Subject;
