import { Schema, model, Types } from 'mongoose';

export interface INotification {
  userId: Types.ObjectId;
  type: 'NEW_REVIEW' | 'NEW_MOVIE_IN_GENRE' | 'REVIEW_REPLY' | 'SYSTEM';
  title: string;
  message: string;
  payload?: string;
  isRead: boolean;
  isDeleted: boolean;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['NEW_REVIEW', 'NEW_MOVIE_IN_GENRE', 'REVIEW_REPLY', 'SYSTEM'], 
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    payload: { type: String },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model<INotification>('Notification', NotificationSchema);