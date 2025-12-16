// movieResolver.ts
import { IResolvers } from '@graphql-tools/utils';
import Movie from '../../models/Movie';
import { pubsub, NEW_MOVIE_IN_GENRE } from '../../pubsub';
import { requireAdmin } from '../../utils/authHelpers';

export const movieResolver: IResolvers = {
  Query: {
    movies: async () => {
      return await Movie.find({ isDeleted: false })
        .populate('genres')
        .sort({ createdAt: -1 });
    },
    
    movie: async (_: any, { id }: { id: string }) => {
      const movie = await Movie.findById(id).populate('genres');
      if (!movie) throw new Error('Movie not found');
      return movie;
    }
  },
  
  Mutation: {
    createMovie: async (_: any, { input }: any, context: any) => {
      // Проверяем, что пользователь - админ
      requireAdmin(context);
      
      console.log('\n=== CREATING MOVIE ===');
      console.log('Input:', JSON.stringify(input, null, 2));
      
      const movie = await Movie.create(input) as any;
      const populatedMovie = await movie.populate('genres');

      console.log('Movie created with ID:', populatedMovie.id);
      console.log('Created by admin:', context.user?.email);
      console.log('Genres:', populatedMovie.genres.map((g: any) => ({ id: g.id, name: g.name })));

      const movieData = populatedMovie.toObject({ getters: true });

      // Отправляем уведомления для подписчиков жанров
      populatedMovie.genres.forEach((genre: any) => {
        const payload = {
          genreId: genre.id.toString(), 
          movieAddedToFavoriteGenre: movieData
        };
        
        console.log(`\n📢 PUBLISHING to "${NEW_MOVIE_IN_GENRE}"`);
        console.log('Genre ID:', genre.id.toString());
        console.log('Movie:', { id: movieData.id, title: movieData.title });
        
        try {
          pubsub.publish(NEW_MOVIE_IN_GENRE, payload);
          console.log('✅ Published successfully');
        } catch (error) {
          console.error('❌ Publish failed:', error);
        }
      });

      console.log('=== END MOVIE CREATION ===\n');
      
      return populatedMovie;
    },
    
    // Добавьте другие мутации для фильмов с проверкой прав
    updateMovie: async (_: any, { id, input }: any, context: any) => {
      requireAdmin(context);
      
      const movie = await Movie.findByIdAndUpdate(
        id,
        { ...input, updatedAt: new Date() },
        { new: true }
      ).populate('genres');
      
      if (!movie) throw new Error('Movie not found');
      return movie;
    },
    
    deleteMovie: async (_: any, { id }: any, context: any) => {
      requireAdmin(context);
      
      const movie = await Movie.findByIdAndUpdate(
        id,
        { isDeleted: true, updatedAt: new Date() },
        { new: true }
      );
      
      if (!movie) throw new Error('Movie not found');
      return movie;
    }
  }
};