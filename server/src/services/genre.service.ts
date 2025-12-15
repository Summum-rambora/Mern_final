import Genre from '../models/Genre';

export const createGenre = async (input: any) => {
  return await Genre.create(input);
};

export const getGenres = async () => {
  return await Genre.find({ isDeleted: false });
};
