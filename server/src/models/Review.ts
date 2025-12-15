import { Schema, model, Types } from 'mongoose';

export interface IReview extends Document{
  _id: Types.ObjectId;
  user: Types.ObjectId;
  movie: Types.ObjectId;
  rating: number;
  comment: string;
  isDeleted: boolean;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    comment: { type: String },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model<IReview>('Review', ReviewSchema);
