import { Schema, model, Types } from 'mongoose';

export interface IMovie {
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  genres: Types.ObjectId[];
  ratingAvg: number;
  isDeleted: boolean;
}

const MovieSchema = new Schema<IMovie>(
  {
    title: { type: String, required: true },
    description: { type: String },
    releaseYear: { type: Number, required: true },
    duration: { type: Number, required: true },
    genres: [{ type: Schema.Types.ObjectId, ref: 'Genre' }],
    ratingAvg: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model<IMovie>('Movie', MovieSchema);
