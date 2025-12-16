
import User from '../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/index';
import { requireAuth, requireAdmin } from '../../utils/authHelpers';

export const userResolver = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      const user = requireAuth(context);
      return await User.findById(user.id)
        .select('-passwordHash')
        .populate('favoriteGenres favoriteMovies');
    },

    allUsers: async (_: any, __: any, context: any) => {
      console.log('📋 allUsers query called');
      
    
      requireAdmin(context);
      
      const users = await User.find({})
        .select('-passwordHash')
        .populate('favoriteGenres favoriteMovies')
        .sort({ createdAt: -1 });
      
      console.log(`✅ Found ${users.length} users`);
      
      return users;
    }
  
  },
  
  Mutation: {
    register: async (_: any, args: { email: string; username: string; password: string }) => {
      const emailVal = args.email;
      const usernameVal = args.username;
      const passwordVal = args.password;

      const existingUser = await User.findOne({ 
        $or: [{ email: emailVal }, { username: usernameVal }]   
      });
      
      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      const hash = await bcrypt.hash(passwordVal, 10);

      const user = await User.create({
        email: emailVal,
        username: usernameVal,
        passwordHash: hash,
        role: 'USER',
        favoriteGenres: [],
        favoriteMovies: [],
      });

      const token = jwt.sign(
        { 
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role 
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      
      return { 
        user: await User.findById(user._id).select('-passwordHash'), 
        token 
      };
      
    },

    login: async (_: any, args: { email: string; password: string }) => {
      const emailVal = args.email;
      const passwordVal = args.password;

      const user = await User.findOne({ email: emailVal, isDeleted: false });
      if (!user) throw new Error('User not found');

      const valid = await bcrypt.compare(passwordVal, user.passwordHash);
      if (!valid) throw new Error('Invalid password');

      const token = jwt.sign(
        { 
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role 
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      return { 
        user: await User.findById(user._id).select('-passwordHash'), 
        token 
      };
    },

    toggleFavoriteGenre: async (_: any, { genreId }: { genreId: any }, context: any) => {
      const user = requireAuth(context);

      const existingUser = await User.findById(user.id);
      if (!existingUser) throw new Error("User not found");

      const genreIndex = existingUser.favoriteGenres.findIndex(
        (g: any) => g.toString() === genreId.toString()
      );

      if (genreIndex > -1) {
        existingUser.favoriteGenres.splice(genreIndex, 1);
      } else {
        existingUser.favoriteGenres.push(genreId);
      }

      await existingUser.save();
      return await existingUser.populate('favoriteGenres favoriteMovies');
    },

    toggleFavoriteMovie: async (_: any, { movieId }: { movieId: any }, context: any) => {
      const user = requireAuth(context);

      const existingUser = await User.findById(user.id);
      if (!existingUser) throw new Error("User not found");

      const movieIndex = existingUser.favoriteMovies.findIndex(
        (m: any) => m.toString() === movieId.toString()
      );

      if (movieIndex > -1) {
        existingUser.favoriteMovies.splice(movieIndex, 1);
      } else {
        existingUser.favoriteMovies.push(movieId);
      }

      await existingUser.save();
      return await existingUser.populate('favoriteGenres favoriteMovies');
    },
    updateUserRole: async (
      _: any, 
      { id, role }: { id: string; role: string }, 
      context: any
    ) => {
      requireAdmin(context);
      
      if (!['USER', 'ADMIN'].includes(role)) {
        throw new Error('Role must be USER or ADMIN');
      }
      
      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true }
      )
        .select('-passwordHash')
        .populate('favoriteGenres favoriteMovies');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    },

    deleteUser: async (_: any, { id }: { id: string }, context: any) => {
      requireAdmin(context);
      
      const user = await User.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      )
        .select('-passwordHash')
        .populate('favoriteGenres favoriteMovies');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    },

    restoreUser: async (_: any, { id }: { id: string }, context: any) => {
      requireAdmin(context);
      
      const user = await User.findByIdAndUpdate(
        id,
        { isDeleted: false },
        { new: true }
      )
        .select('-passwordHash')
        .populate('favoriteGenres favoriteMovies');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    }
  }

  

  
};