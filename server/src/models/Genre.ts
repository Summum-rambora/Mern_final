import { Schema, model } from 'mongoose';

export interface IGenre {
  name: string;
  description: string;
  slug: string;
  isArchived: boolean;
}

const GenreSchema = new Schema<IGenre>(
  {
    name: { type: String, required: true },
    description: { type: String },
    slug: { type: String, required: true, unique: true },
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model<IGenre>('Genre', GenreSchema);
