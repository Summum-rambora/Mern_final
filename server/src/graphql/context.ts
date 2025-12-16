// context.ts
import { Request } from 'express';
import { verifyToken } from '../utils/auth';
import User from '../models/User';

export interface ContextUser {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  isDeleted: boolean;
}

export interface Context {
  req: Request;
  user?: ContextUser;
}

export const context = async ({ req }: { req: Request }): Promise<Context> => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return { req };

  try {
    const decoded: any = verifyToken(token);
    const user = await User.findById(decoded.id)
      .select('email username role isDeleted')
      .lean();

    if (!user || user.isDeleted) {
      return { req };
    }

    return {
      req,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        isDeleted: user.isDeleted,
      },
    };
  } catch (err) {
    console.error('Context error:', err);
    return { req };
  }
};