import { Schema, model, Types } from 'mongoose';

export interface IReview {
  user: Types.ObjectId;
  movie: Types.ObjectId;
  rating: number;
  comment: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    comment: { type: String }
  },
  { timestamps: true }
);

export default model<IReview>('Review', ReviewSchema);
