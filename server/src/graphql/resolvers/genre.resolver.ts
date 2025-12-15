import { IResolvers } from '@graphql-tools/utils';
import Genre from '../../models/Genre';

export const genreResolver: IResolvers = {
  Query: {
    genres: async () => {
      return await Genre.find({ isArchived: false });
    }
  },
  Mutation: {
    createGenre: async (_: any, { input }: any) => {
      const genre = await Genre.create(input);
      return genre;
    }
  }
};
