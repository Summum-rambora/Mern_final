import { Schema, model, Types } from 'mongoose';

export interface INotification {
  user: Types.ObjectId;
  type: 'NEW_REVIEW' | 'NEW_MOVIE_IN_GENRE';
  message: string;
  movie?: Types.ObjectId;
  review?: Types.ObjectId;
  isRead: boolean;
  isDeleted: boolean;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['NEW_REVIEW', 'NEW_MOVIE_IN_GENRE'], 
      required: true 
    },
    message: { type: String, required: true },
    movie: { type: Schema.Types.ObjectId, ref: 'Movie' },
    review: { type: Schema.Types.ObjectId, ref: 'Review' },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model<INotification>('Notification', NotificationSchema);