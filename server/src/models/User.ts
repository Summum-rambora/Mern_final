import { Schema, model, Types } from 'mongoose';

export interface IUser {
  email: string;
  passwordHash: string;
  username: string;
  role: 'USER' | 'ADMIN';
  favoriteGenres: Types.ObjectId[];
  favoriteMovies: Types.ObjectId[];
  isDeleted: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    username: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    favoriteGenres: [{ type: Schema.Types.ObjectId, ref: 'Genre' }],
    favoriteMovies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }],
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model<IUser>('User', UserSchema);
