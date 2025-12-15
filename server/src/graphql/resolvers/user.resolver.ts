import User from '../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/index';

export const userResolver =  {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      return await User.findById(context.user.id).populate('favoriteGenres favoriteMovies');
    }
  },
  Mutation: {
    register: async (_: any, args: { email: string; username: string; password: string }) => {
  const emailVal = args.email;
  const usernameVal = args.username;
  const passwordVal = args.password;

  const hash = await bcrypt.hash(passwordVal, 10);

  const user = await User.create({
    email: emailVal,
    username: usernameVal,
    passwordHash: hash,
    role: 'USER',
    favoriteGenres: [],
    favoriteMovies: [],
  });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
  return { user, token };
}
,
   login: async (_: any, args: { email: string; password: string }) => {
  const emailVal = args.email;
  const passwordVal = args.password;

  const user = await User.findOne({ email: emailVal });
  if (!user) throw new Error('User not found');

  const valid = await bcrypt.compare(passwordVal, user.passwordHash);
  if (!valid) throw new Error('Invalid password');

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
  return { user, token };
}

  },
  Subscription: {
    notificationCreated: {
      subscribe: () => {
        throw new Error('Not implemented yet'); // потом подключим GraphQL WS
      }
    }
  }
};
