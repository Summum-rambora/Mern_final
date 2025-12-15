import User, { IUser } from '../models/User';
import { hashPassword, comparePassword, signToken } from '../utils/auth';

export const createUser = async (email: string, username: string, password: string) => {
  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, username, passwordHash });
  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) throw new Error('Invalid password');

  const token = signToken({ id: user._id, email: user.email });
  return { user, token };
};
