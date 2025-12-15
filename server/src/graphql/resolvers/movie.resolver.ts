import { IResolvers } from '@graphql-tools/utils';
import Movie from '../../models/Movie';
import Genre from '../../models/Genre';

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
      const movie = await Movie.create(input);
      return movie;
    }
  }
};
