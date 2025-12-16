import { IResolvers } from '@graphql-tools/utils';
import Movie from '../../models/Movie';
import { pubsub, NEW_MOVIE_IN_GENRE } from '../../pubsub';

export const movieResolver: IResolvers = {
  Query: {
    movies: async () => {
      return await Movie.find({ isDeleted: false }).populate('genres');
    },
    movie: async (_: any, { id }: { id: string }) => {
      return await Movie.findById(id).populate('genres');
    }
  },
  Mutation: {

    
    createMovie: async (_: any, { input }: any) => {
      console.log('\n=== CREATING MOVIE ===');
      console.log('Input:', JSON.stringify(input, null, 2));
      
      const movie = await Movie.create(input) as any;
      const populatedMovie = await movie.populate('genres');

      console.log('Movie created with ID:', populatedMovie.id);
      console.log('Genres:', populatedMovie.genres.map((g: any) => ({ id: g.id, name: g.name })));

      const movieData = populatedMovie.toObject({ getters: true });

      populatedMovie.genres.forEach((genre: any) => {
        const payload = {
          genreId: genre.id.toString(), 
          movieAddedToFavoriteGenre: movieData
        };
        
        console.log(`\nPUBLISHING to "${NEW_MOVIE_IN_GENRE}"`);
        console.log('Genre ID:', genre.id.toString());
        console.log('Movie:', { id: movieData.id, title: movieData.title });
        
        try {
          pubsub.publish(NEW_MOVIE_IN_GENRE, payload);
          console.log('Published successfully');
        } catch (error) {
          console.error('Publish failed:', error);
        }
      });

      console.log(' END MOVIE CREATION \n');
      
      return populatedMovie;
    }
  }
};