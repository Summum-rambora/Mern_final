import { Context } from '../graphql/context';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';

export const requireAuth = (context: Context) => {
  if (!context.user) {
    throw new AuthenticationError('Not authenticated. Please log in.');
  }
  
  if (context.user.isDeleted) {
    throw new AuthenticationError('Your account has been deactivated.');
  }
  
  return context.user;
};

export const requireAdmin = (context: Context) => {
  const user = requireAuth(context);
  
  if (user.role !== 'ADMIN') {
    throw new ForbiddenError('Insufficient permissions. Admin access required.');
  }
  
  return user;
};

export const isAdmin = (context: Context): boolean => {
  return context.user?.role === 'ADMIN' && !context.user?.isDeleted;
};