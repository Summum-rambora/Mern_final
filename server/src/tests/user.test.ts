import { userResolver } from '../graphql/resolvers/user.resolver';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/index';
import { requireAuth, requireAdmin } from '../utils/authHelpers';

jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../config/index', () => ({
  JWT_SECRET: 'test-secret-key'
}));
jest.mock('../utils/authHelpers', () => ({
  requireAuth: jest.fn().mockReturnValue({ id: 'user123' }),
  requireAdmin: jest.fn()
}));

const mockUser = {
  _id: 'user123',
  id: 'user123',
  email: 'test@example.com',
  username: 'testuser',
  passwordHash: 'hashedPassword123',
  role: 'USER',
  favoriteGenres: [],
  favoriteMovies: [],
  isDeleted: false,
  save: jest.fn().mockResolvedValue({
    _id: 'user123',
    favoriteGenres: ['genre123'],
    populate: jest.fn().mockResolvedValue({
      _id: 'user123',
      favoriteGenres: ['genre123']
    })
  }),
  populate: jest.fn().mockResolvedValue({
    _id: 'user123',
    favoriteGenres: ['genre123', 'genre456']
  })
};

const mockUserWithoutPassword = {
  ...mockUser,
  passwordHash: undefined
};

describe('userResolver - ОСНОВНЫЕ ТЕСТЫ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const resolver = userResolver as any;

  describe('Query.me', () => {
    it('должен вернуть текущего пользователя без пароля', async () => {
      // Arrange
      const context = { user: { id: 'user123' } };
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockUserWithoutPassword)
      });

      const result = await resolver.Query.me(null, null, context);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockUserWithoutPassword);
    });
  });

  describe('Mutation.register', () => {
    const registerArgs = {
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123'
    };

    

    it('должен создать нового пользователя', async () => {
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (User.findById as jest.Mock).mockResolvedValue(mockUserWithoutPassword);

      const result = await resolver.Mutation.register(null, registerArgs);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [
          { email: registerArgs.email },
          { username: registerArgs.username }
        ]
      });
      expect(User.create).toHaveBeenCalledWith({
        email: registerArgs.email,
        username: registerArgs.username,
        passwordHash: 'hashedPassword123',
        role: 'USER',
        favoriteGenres: [],
        favoriteMovies: []
      });
      expect(result.user).toEqual(mockUserWithoutPassword);
      expect(result.token).toBe('jwt-token-123');
    });
  });

  describe('Mutation.toggleFavoriteGenre', () => {
    it('должен добавить жанр в избранное', async () => {
      const userWithEmptyGenres = {
        ...mockUser,
        favoriteGenres: [],
        save: jest.fn().mockResolvedValue({
          ...mockUser,
          favoriteGenres: ['genre123'],
          populate: jest.fn().mockResolvedValue({
            favoriteGenres: ['genre123']
          })
        })
      };
      (User.findById as jest.Mock).mockResolvedValue(userWithEmptyGenres);

      const result = await resolver.Mutation.toggleFavoriteGenre(
        null, 
        { genreId: 'genre123' }, 
        { user: { id: 'user123' } }
      );

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(userWithEmptyGenres.favoriteGenres).toContain('genre123');
      expect(result).toBeDefined();
    });
  });
});