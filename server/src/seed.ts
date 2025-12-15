import mongoose from 'mongoose';
import User from './models/User';
import Genre from './models/Genre';
import Movie from './models/Movie';

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/cinema');
  await mongoose.connection.db.dropDatabase();

  const action = await Genre.create({ name: 'Action', slug: 'action' });
  const drama = await Genre.create({ name: 'Drama', slug: 'drama' });

  const user = await User.create({ email: 'user@test.com', username: 'user', passwordHash: '123', role: 'USER', favoriteGenres: [], favoriteMovies: [] });

  const movie = await Movie.create({
    title: 'Example Movie',
    description: 'Some description',
    releaseYear: 2023,
    duration: 120,
    genres: [action._id, drama._id],
    ratingAvg: 0
  });

  console.log('✅ Seed completed');
  await mongoose.disconnect();
}

seed();
