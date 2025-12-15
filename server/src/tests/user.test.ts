import User from '@models/User';
import mongoose from 'mongoose';

describe('User model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/cinema-test');
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  it('should create a user', async () => {
    const user = await User.create({ email: 'a@test.com', username: 'test', passwordHash: '123', role: 'USER', favoriteGenres: [], favoriteMovies: [], isDeleted: false });
    expect(user.email).toBe('a@test.com');
  });
});
