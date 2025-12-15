import { Request } from 'express';
import { verifyToken } from '../utils/auth';
import User from '../models/User';

export interface Context {
  req: Request;
  user?: any;
}

export const context = async ({ req }: { req: Request }) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return { req };

  try {
    const decoded: any = verifyToken(token);
    const user = await User.findById(decoded.id);
    return { req, user };
  } catch (err) {
    return { req };
  }
};
