import { ApolloServer } from 'apollo-server-express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import { makeExecutableSchema } from '@graphql-tools/schema';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('mocked_hashed_password'),
  compare: jest.fn().mockResolvedValue(true)
}));

import { userResolver } from '../graphql/resolvers/user.resolver';
import User from '../models/User';

const typeDefs = `
  type User {
    id: ID!
    email: String!
    username: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type Query {
    me: User
    allUsers: [User!]!
  }

  type Mutation {
    register(email: String!, username: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    toggleFavoriteGenre(genreId: ID!): User!
    toggleFavoriteMovie(movieId: ID!): User!
  }
`;

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: userResolver
});

describe('User Resolver - Интеграционные тесты', () => {
  let mongoServer: MongoMemoryServer;
  let server: ApolloServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    server = new ApolloServer({
      schema, 
      context: () => ({})
    });
  });

  beforeEach(async () => {
    await User.deleteMany({});
    (bcrypt.hash as jest.Mock).mockResolvedValue('mocked_hashed_password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('Регистрация пользователя', () => {
    it('должен создать пользователя в БД и вернуть токен', async () => {
      const REGISTER_MUTATION = `
        mutation Register($email: String!, $username: String!, $password: String!) {
          register(email: $email, username: $username, password: $password) {
            user {
              id
              email
              username
            }
            token
          }
        }
      `;

      const response = await server.executeOperation({
        query: REGISTER_MUTATION,
        variables: {
          email: 'new@example.com',
          username: 'newuser',
          password: 'password123'
        }
      });

      if (response.errors) {
        console.log('GraphQL Errors:', response.errors);
      }

      expect(response.errors).toBeUndefined();
      expect(response.data?.register.user.email).toBe('new@example.com');
      expect(response.data?.register.user.username).toBe('newuser');
      expect(response.data?.register.token).toBeDefined();

      const userInDb = await User.findOne({ email: 'new@example.com' });
      expect(userInDb).toBeDefined();
      expect(userInDb?.username).toBe('newuser');
    });
  });

  describe('Вход пользователя', () => {
    it('должен аутентифицировать существующего пользователя', async () => {
      await User.create({
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'mocked_hashed_password',
        role: 'USER'
      });

      const LOGIN_MUTATION = `
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            user {
              id
              email
              username
            }
            token
          }
        }
      `;

      const response = await server.executeOperation({
        query: LOGIN_MUTATION,
        variables: {
          email: 'test@example.com',
          password: 'password123'
        }
      });

      if (response.errors) {
        console.log('Login Errors:', response.errors);
      }

      expect(response.errors).toBeUndefined();
      expect(response.data?.login.user.email).toBe('test@example.com');
      expect(response.data?.login.token).toBeDefined();
    });
  });
});